import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// const MAX_WORD_LENGTH = 10; // Limit the length of solutions

const fetchDictionary = async (): Promise<string[]> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch dictionary");
    }
    const text = await response.text();
    return text
      .split("\n")
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0);
  } catch (error) {
    console.error("Error fetching dictionary:", error);
    return [];
  }
};

type SolverFunction = (
  input: string,
  dictionary: string[],
  minLength: number,
  maxLength: number
) => string[];

const solveAnagram: SolverFunction = (
  input,
  dictionary,
  minLength,
  maxLength
) => {
  if (!input) return [];

  const cleanedInput = input.replace(/[^a-zA-Z*]/g, "");
  const trimmedInput = cleanedInput.trim().toLowerCase();
  const inputLetters = trimmedInput.replace(/\*/g, "").split("");
  const wildcardCount = (trimmedInput.match(/\*/g) || []).length;

  return dictionary.filter((word) => {
    if (word.length < minLength || word.length > maxLength) {
      return false;
    }

    const wordLetters = word.split("");
    let remainingWildcards = wildcardCount;
    const inputLettersCopy = [...inputLetters];

    // Check if the word can be formed with the input letters and wildcards
    for (const letter of wordLetters) {
      const letterIndex = inputLettersCopy.indexOf(letter);
      if (letterIndex !== -1) {
        inputLettersCopy.splice(letterIndex, 1);
      } else if (remainingWildcards > 0) {
        remainingWildcards--;
      } else {
        return false;
      }
    }
    return true;
  });
};

const getHint = (
  input: string,
  dictionary: string[],
  minLength: number,
  maxLength: number
): string => {
  const possibleWords = solveAnagram(input, dictionary, minLength, maxLength);
  return possibleWords.length > 0
    ? possibleWords[0].slice(0, 2) + "..."
    : "No hints available";
};

export default function WordPuzzleSolver() {
  const [input, setInput] = useState<string>("");
  const [solutions, setSolutions] = useState<string[]>([]);
  const [hint, setHint] = useState<string>("");
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");

  useEffect(() => {
    fetchDictionary()
      .then(setDictionary)
      .catch(() => setFetchError(true));
  }, []);

  const handleSolve = () => {
    const min = minLength ? parseInt(minLength, 10) : 1;
    const max = maxLength ? parseInt(maxLength, 10) : Infinity;
    setSolutions(solveAnagram(input, dictionary, min, max));
  };

  const handleHint = () => {
    const min = minLength ? parseInt(minLength, 10) : 1;
    const max = maxLength ? parseInt(maxLength, 10) : Infinity;
    setHint(getHint(input, dictionary, min, max));
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Word Puzzle Solver</h1>
      {fetchError && (
        <p className="text-red-600">
          Failed to load dictionary. Please check your connection.
        </p>
      )}
      <Card className="w-96 p-4 mt-4">
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Use * for unknown letters (e.g., "c*t" → "cat")
          </p>
          <Input
            className="w-full"
            value={input}
            onChange={(e) =>
              setInput(e.target.value.replace(/[^a-zA-Z*]/g, "").trim())
            }
            onKeyDown={(e) => e.key === "Enter" && handleSolve()}
          />
          <div className="flex gap-2">
            <Input
              className="w-full"
              placeholder="Min Length"
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
            />
            <Input
              className="w-full"
              placeholder="Max Length"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSolve} disabled={!input.trim()}>
              Solve
            </Button>
            <Button onClick={handleHint} disabled={!input.trim()}>
              Hint
            </Button>
          </div>
        </CardContent>
      </Card>
      {hint && <p className="mt-4 text-blue-600">Hint: {hint}</p>}
      {solutions.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold">Possible Words:</h2>
          <ul>
            {solutions.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
