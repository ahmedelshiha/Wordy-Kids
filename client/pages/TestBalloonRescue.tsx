import React from "react";
import { BalloonRescueVowelAdventure } from "../components/games/BalloonRescueVowelAdventure";

export default function TestBalloonRescue() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎈 Balloon Rescue Test Page
        </h1>
        <BalloonRescueVowelAdventure
          totalQuestions={5}
          onFinish={(result) => {
            console.log("Game finished!", result);
            alert(`Game completed! You rescued ${result.correctAnswers} out of ${result.totalQuestions} balloons!`);
          }}
          onHome={() => {
            console.log("Returning home");
            alert("Going back to home");
          }}
        />
      </div>
    </div>
  );
}
