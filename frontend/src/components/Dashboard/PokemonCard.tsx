import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PokemonSuggestion } from "@/types/weather.types";

interface PokemonCardProps {
  pokemon: PokemonSuggestion;
}

const TYPE_COLORS: Record<string, string> = {
  fire: "bg-orange-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-500",
  ice: "bg-cyan-400",
  rock: "bg-gray-600",
  ghost: "bg-purple-600",
  dark: "bg-gray-800",
  normal: "bg-gray-400",
  dragon: "bg-indigo-600",
  psychic: "bg-pink-500",
  fighting: "bg-red-600",
  flying: "bg-blue-300",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  bug: "bg-green-600",
  fairy: "bg-pink-300",
  steel: "bg-gray-500",
};

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const { name, reasoning, pokemon_data } = pokemon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Sprite */}
        {pokemon_data?.sprites?.front_default && (
          <div className="flex justify-center mb-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
            <img
              src={pokemon_data.sprites.front_default}
              alt={name}
              className="w-24 h-24 object-contain"
            />
          </div>
        )}

        {/* Nome */}
        <h3 className="text-lg font-bold capitalize text-center mb-2">
          {name}
        </h3>

        {/* Tipos */}
        {pokemon_data?.types && (
          <div className="flex gap-2 justify-center mb-3 flex-wrap">
            {pokemon_data.types.map((type) => (
              <Badge
                key={type}
                className={`${
                  TYPE_COLORS[type] || "bg-gray-400"
                } text-white capitalize`}
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        {pokemon_data?.stats && (
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">HP</p>
              <p className="font-semibold">{pokemon_data.stats.hp}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">ATK</p>
              <p className="font-semibold">{pokemon_data.stats.attack}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">DEF</p>
              <p className="font-semibold">{pokemon_data.stats.defense}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">SPD</p>
              <p className="font-semibold">{pokemon_data.stats.speed}</p>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground italic border-t pt-2">
          {reasoning}
        </p>
      </CardContent>
    </Card>
  );
}
