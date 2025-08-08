import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shuffle, 
  RotateCcw, 
  CheckCircle2, 
  Star,
  Trophy,
  Clock
} from 'lucide-react';

interface MatchingPair {
  id: number;
  word: string;
  definition: string;
  matched: boolean;
}

interface WordMatchingGameProps {
  pairs: MatchingPair[];
  onComplete: (score: number, timeSpent: number) => void;
}

export const WordMatchingGame: React.FC<WordMatchingGameProps> = ({
  pairs,
  onComplete
}) => {
  const [words, setWords] = useState<Array<{id: number, text: string, type: 'word' | 'definition', matched: boolean, selected: boolean}>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<{id: number, type: 'word' | 'definition'}>>([]);
  const [matches, setMatches] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [timeStart] = useState<number>(Date.now());
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  useEffect(() => {
    initializeGame();
  }, [pairs]);

  const initializeGame = () => {
    const wordItems = pairs.map(pair => ({
      id: pair.id,
      text: pair.word,
      type: 'word' as const,
      matched: false,
      selected: false
    }));

    const definitionItems = pairs.map(pair => ({
      id: pair.id,
      text: pair.definition,
      type: 'definition' as const,
      matched: false,
      selected: false
    }));

    const allItems = [...wordItems, ...definitionItems];
    setWords(shuffleArray(allItems));
    setSelectedItems([]);
    setMatches(0);
    setAttempts(0);
    setGameComplete(false);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleItemClick = (item: {id: number, text: string, type: 'word' | 'definition', matched: boolean, selected: boolean}) => {
    if (item.matched || selectedItems.length >= 2) return;

    const isAlreadySelected = selectedItems.some(selected => 
      selected.id === item.id && selected.type === item.type
    );

    if (isAlreadySelected) {
      // Deselect item
      setSelectedItems(selectedItems.filter(selected => 
        !(selected.id === item.id && selected.type === item.type)
      ));
      setWords(words.map(w => 
        w.id === item.id && w.type === item.type 
          ? {...w, selected: false}
          : w
      ));
      return;
    }

    const newSelectedItems = [...selectedItems, {id: item.id, type: item.type}];
    setSelectedItems(newSelectedItems);
    
    setWords(words.map(w => 
      w.id === item.id && w.type === item.type 
        ? {...w, selected: true}
        : w
    ));

    if (newSelectedItems.length === 2) {
      setAttempts(attempts + 1);
      
      // Check if it's a match (same id, different types)
      const [first, second] = newSelectedItems;
      if (first.id === second.id && first.type !== second.type) {
        // Match found!
        setTimeout(() => {
          setWords(words.map(w => 
            w.id === first.id 
              ? {...w, matched: true, selected: false}
              : w
          ));
          setMatches(matches + 1);
          setSelectedItems([]);
          
          if (matches + 1 === pairs.length) {
            setGameComplete(true);
            const timeSpent = Math.round((Date.now() - timeStart) / 1000);
            setTimeout(() => onComplete(matches + 1, timeSpent), 1000);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setWords(words.map(w => 
            newSelectedItems.some(selected => selected.id === w.id && selected.type === w.type)
              ? {...w, selected: false}
              : w
          ));
          setSelectedItems([]);
        }, 1500);
      }
    }
  };

  const getItemClassName = (item: {matched: boolean, selected: boolean, type: 'word' | 'definition'}) => {
    if (item.matched) {
      return 'bg-green-100 border-green-300 text-green-800 cursor-default';
    }
    if (item.selected) {
      return selectedItems.length === 2 && selectedItems[0].id === selectedItems[1].id
        ? 'bg-green-100 border-green-300 text-green-800'
        : selectedItems.length === 2
        ? 'bg-red-100 border-red-300 text-red-800'
        : 'bg-blue-100 border-blue-300 text-blue-800';
    }
    return item.type === 'word' 
      ? 'bg-educational-blue/10 border-educational-blue/30 hover:bg-educational-blue/20 hover:border-educational-blue/50'
      : 'bg-educational-purple/10 border-educational-purple/30 hover:bg-educational-purple/20 hover:border-educational-purple/50';
  };

  const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;
  const progress = (matches / pairs.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-educational-yellow" />
            Word Matching Challenge
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge variant="outline">
                Matches: {matches}/{pairs.length}
              </Badge>
              <Badge variant="outline">
                Attempts: {attempts}
              </Badge>
              <Badge variant="outline">
                Accuracy: {accuracy}%
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={initializeGame}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWords(shuffleArray([...words]))}
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Game Instructions */}
      {!gameComplete && matches === 0 && (
        <Card className="bg-educational-blue/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">How to Play</h3>
            <p className="text-slate-600">
              Match each word with its correct definition by clicking on them. 
              Words are in <span className="text-educational-blue font-semibold">blue</span> and 
              definitions are in <span className="text-educational-purple font-semibold">purple</span>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
            <p className="text-xl mb-4">
              You matched all {pairs.length} pairs!
            </p>
            <div className="flex justify-center gap-6 text-lg">
              <div>
                <div className="font-bold">{attempts}</div>
                <div className="text-sm opacity-90">Attempts</div>
              </div>
              <div>
                <div className="font-bold">{accuracy}%</div>
                <div className="text-sm opacity-90">Accuracy</div>
              </div>
              <div>
                <div className="font-bold">{Math.round((Date.now() - timeStart) / 1000)}s</div>
                <div className="text-sm opacity-90">Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {words.map((item, index) => (
          <Card
            key={`${item.id}-${item.type}-${index}`}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${getItemClassName(item)}`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-4 text-center min-h-[120px] flex items-center justify-center">
              <div>
                {item.matched && (
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                )}
                <p className={`font-medium ${
                  item.type === 'word' ? 'text-lg' : 'text-sm'
                }`}>
                  {item.text}
                </p>
                <Badge 
                  variant="outline" 
                  className="mt-2 text-xs"
                >
                  {item.type === 'word' ? 'Word' : 'Definition'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
