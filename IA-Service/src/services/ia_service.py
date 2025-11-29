import asyncio
import json
from typing import List

from core.config import config
from core.logger import get_logger

from schemas.weather_payload import WeatherPayload
from schemas.enriched_output import EnrichedWeatherPayload, PokemonSuggestion

logger = get_logger("ia.ai_service")

CONDITION_TO_TYPES = {
    "clear": ["fire", "grass"],
    "céu limpo": ["fire", "grass"],
    "sunny": ["fire", "grass"],
    "partly cloudy": ["normal"],
    "parcialmente nublado": ["normal"],
    "cloudy": ["rock", "normal"],
    "nublado": ["rock", "normal"],
    "rain": ["water", "electric"],
    "chuva": ["water", "electric"],
    "drizzle": ["water"],
    "snow": ["ice"],
    "neve": ["ice"],
    "fog": ["ghost", "dark"],
    "neblina": ["ghost", "dark"],
    "thunderstorm": ["electric", "dragon"],
    "trovoada": ["electric", "dragon"],
}

TYPE_TO_EXAMPLE_POKEMONS = {
    "water": ["Squirtle", "Poliwag", "Vaporeon"],
    "electric": ["Pikachu", "Jolteon", "Magnemite"],
    "fire": ["Charmander", "Vulpix", "Growlithe"],
    "grass": ["Bulbasaur", "Oddish", "Leafeon"],
    "ice": ["Snom", "Lapras", "Glalie"],
    "rock": ["Geodude", "Onix", "Rhyhorn"],
    "ghost": ["Gastly", "Misdreavus", "Gengar"],
    "dark": ["Murkrow", "Sableye", "Houndour"],
    "normal": ["Rattata", "Pidgey", "Bidoof"],
    "dragon": ["Dratini", "Bagon", "Gible"],
}


async def call_groq(prompt: str) -> str:
    try:
        from groq import Groq
    except Exception as e:
        raise RuntimeError(f"Groq client não disponível: {e}")

    if not config.groq_api_key:
        raise RuntimeError("GROQ_API_KEY não configurada")

    try:
        client = Groq(api_key=config.groq_api_key)

        def _call():
            return client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Você é um assistente que SEMPRE responde em JSON válido, "
                            "sem texto fora do JSON."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

        resp = await asyncio.to_thread(_call)
        if getattr(resp, "choices", None):
            content = getattr(resp.choices[0].message, "content", None)
            if isinstance(content, str):
                return content
        return json.dumps({"raw_response": str(resp)}, ensure_ascii=False)
    except Exception as e:
        raise RuntimeError(f"Erro ao chamar Groq: {e}")


def _normalize_condition(cond: str) -> str:
    if not cond:
        return ""
    return cond.strip().lower()


def _rule_based_recommendation(condition: str) -> (List[str], List[PokemonSuggestion], List[str]):
    cond_norm = _normalize_condition(condition)
    types = CONDITION_TO_TYPES.get(cond_norm)
    if not types:
        for key, t in CONDITION_TO_TYPES.items():
            if key in cond_norm:
                types = t
                break

    if not types:
        types = ["normal"]

    types = list(dict.fromkeys(types))

    suggestions: List[PokemonSuggestion] = []
    for t in types:
        examples = TYPE_TO_EXAMPLE_POKEMONS.get(t, [])
        for ex in examples:
            reasoning = f"Tipo {t} — apropriado para clima '{condition}'"
            suggestions.append(PokemonSuggestion(name=ex, reasoning=reasoning))
            if len(suggestions) >= 6:
                break
        if len(suggestions) >= 6:
            break

    insights = [
        f"Condição registrada: '{condition}'. Tipos recomendados: {', '.join(types)}.",
        f"Exemplos de pokémons que se adaptam ao clima: {', '.join([p.name for p in suggestions[:5]])}."
    ]

    return types, suggestions, insights


async def enrich_payload(payload: WeatherPayload) -> EnrichedWeatherPayload:
    logger.info(f"🔎 Enriquecendo payload {payload.external_id} — cidade {payload.location.city}")

    condition = payload.condition or ""
    try:
        if config.groq_api_key:
            prompt = (
                "Você é um assistente que analisa dados climáticos e sugere tipos de pokémon "
                "e exemplos de pokémons que combinam com o clima. Retorne uma resposta JSON com os campos:\n"
                "insights: [..], recommended_types: [..], suggested_pokemons: [{name:, reasoning:}, ...]\n\n"
                "Dados de entrada:\n"
                f"{json.dumps(payload.model_dump(), default=str, ensure_ascii=False)}\n\n"
                "Se não for possível gerar, retorne apenas um texto descrevendo o motivo."
            )

            try:
                model_resp = await call_groq(prompt)
                parsed = json.loads(model_resp)

                raw_insights = parsed.get("insights") or []
                insights: List[str] = []
                if isinstance(raw_insights, list):
                    for it in raw_insights:
                        if isinstance(it, str):
                            insights.append(it)
                        elif isinstance(it, dict):
                            text = (
                                it.get("text")
                                or it.get("description")
                                or it.get("summary")
                            )
                            insights.append(
                                text if isinstance(text, str) else json.dumps(it, ensure_ascii=False)
                            )
                        else:
                            insights.append(str(it))
                else:
                    insights = [str(raw_insights)]

                recommended_types = parsed.get("recommended_types") or []
                suggested_raw = parsed.get("suggested_pokemons") or []

                suggested: List[PokemonSuggestion] = []
                for item in suggested_raw:
                    if isinstance(item, dict) and item.get("name"):
                        suggested.append(
                            PokemonSuggestion(
                                name=item["name"], reasoning=item.get("reasoning", "")
                            )
                        )
                    elif isinstance(item, str):
                        suggested.append(
                            PokemonSuggestion(
                                name=item, reasoning="sugerido pelo modelo"
                            )
                        )

                enriched = EnrichedWeatherPayload(
                    base=payload,
                    insights=insights,
                    recommended_types=recommended_types,
                    suggested_pokemons=suggested,
                )
                logger.info("✅ Enriquecimento via Groq bem-sucedido")
                return enriched

            except Exception as e:
                logger.error(f"⚠ Falha ao chamar Groq: {e} — usando fallback rule-based")

        types, suggestions, insights = _rule_based_recommendation(condition)
        enriched = EnrichedWeatherPayload(
            base=payload,
            insights=insights,
            recommended_types=types,
            suggested_pokemons=suggestions,
        )
        logger.info("🔧 Enriquecimento rule-based aplicado")
        return enriched

    except Exception as final_exc:
        logger.error(f"Erro inesperado durante enrich: {final_exc}")
        types, suggestions, insights = _rule_based_recommendation(condition)
        enriched = EnrichedWeatherPayload(
            base=payload,
            insights=insights,
            recommended_types=types,
            suggested_pokemons=suggestions,
        )
        return enriched
