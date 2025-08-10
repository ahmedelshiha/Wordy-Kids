{/* All Unique Games and Quizzes - Redesigned Without Duplicates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                        
                        {/* Word Adventure - Interactive Learning */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-green/30 bg-gradient-to-br from-green-50 to-emerald-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-xl font-bold text-educational-green mb-2">
                              Word Adventure
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Journey through words with interactive learning!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                Easy
                              </span>
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                10 Words
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowWordAdventure(true)}
                              className="w-full bg-educational-green text-white hover:bg-educational-green/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Adventure!
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Memory Match - Matching Game */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-purple/30 bg-gradient-to-br from-purple-50 to-violet-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🧩</div>
                            <h3 className="text-xl font-bold text-educational-purple mb-2">
                              Memory Match
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Match words with definitions to test your memory!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                Medium
                              </span>
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                6 Pairs
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowMatchingGame(true)}
                              className="w-full bg-educational-purple text-white hover:bg-educational-purple/90"
                            >
                              <Shuffle className="w-4 h-4 mr-2" />
                              Start Matching!
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Pronunciation Practice - Audio Learning */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-blue/30 bg-gradient-to-br from-blue-50 to-cyan-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🎤</div>
                            <h3 className="text-xl font-bold text-educational-blue mb-2">
                              Pronunciation Practice
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Perfect your pronunciation with audio guidance!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-blue/20 text-educational-blue px-2 py-1 rounded-full text-xs">
                                Easy
                              </span>
                              <span className="bg-educational-blue/20 text-educational-blue px-2 py-1 rounded-full text-xs">
                                8 Words
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowPronunciationParty(true)}
                              className="w-full bg-educational-blue text-white hover:bg-educational-blue/90"
                            >
                              <Volume2 className="w-4 h-4 mr-2" />
                              Start Practice!
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Lightning Speed - Fast Paced Learning */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-orange/30 bg-gradient-to-br from-orange-50 to-red-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold text-educational-orange mb-2">
                              Lightning Speed
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Learn words at lightning speed with quick challenges!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-orange/20 text-educational-orange px-2 py-1 rounded-full text-xs">
                                Hard
                              </span>
                              <span className="bg-educational-orange/20 text-educational-orange px-2 py-1 rounded-full text-xs">
                                15 Words
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowLightningLearning(true)}
                              className="w-full bg-educational-orange text-white hover:bg-educational-orange/90"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Start Lightning!
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Definition Detective - Unique Detective Game */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-400/30 bg-gradient-to-br from-gray-50 to-slate-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">
                              Definition Detective
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Solve word mysteries by finding correct meanings!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                Hard
                              </span>
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                Detective Mode
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("definition_detective");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-gray-700 text-white hover:bg-gray-800"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Start Detective!
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Quick Quiz - Beginner Friendly */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-green-400/30 bg-gradient-to-br from-green-50 to-lime-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🌱</div>
                            <h3 className="text-xl font-bold text-green-600 mb-2">
                              Quick Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Perfect for beginners! Simple vocabulary questions.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                5 Questions
                              </span>
                              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                30s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("quick");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-green-600 text-white hover:bg-green-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Quick Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Standard Quiz - Balanced Challenge */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-400/30 bg-gradient-to-br from-blue-50 to-indigo-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-blue-600 mb-2">
                              Standard Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Balanced difficulty with mixed vocabulary types.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                                10 Questions
                              </span>
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                                30s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("standard");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Start Standard Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Challenge Quiz - Expert Level */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-400/30 bg-gradient-to-br from-purple-50 to-fuchsia-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-xl font-bold text-purple-600 mb-2">
                              Challenge Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Expert level with advanced vocabulary concepts.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                                15 Questions
                              </span>
                              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                                25s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("challenge");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Start Challenge Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Picture Quiz - Visual Learning */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-400/30 bg-gradient-to-br from-orange-50 to-amber-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">📸</div>
                            <h3 className="text-xl font-bold text-orange-600 mb-2">
                              Picture Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Visual learning with image-based word matching.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                                8 Questions
                              </span>
                              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                                35s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("picture");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-orange-600 text-white hover:bg-orange-700"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Start Picture Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Spelling Challenge - Audio Based */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-pink-400/30 bg-gradient-to-br from-pink-50 to-rose-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">✏️</div>
                            <h3 className="text-xl font-bold text-pink-600 mb-2">
                              Spelling Challenge
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Test spelling skills with audio pronunciation cues.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                                10 Questions
                              </span>
                              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                                45s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("spelling");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-pink-600 text-white hover:bg-pink-700"
                            >
                              <PenTool className="w-4 h-4 mr-2" />
                              Start Spelling Challenge
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Speed Quiz - Racing Against Time */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50 to-amber-50">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-xl font-bold text-yellow-600 mb-2">
                              Speed Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Racing against time with rapid-fire questions!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                                20 Questions
                              </span>
                              <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                                15s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("speed");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Start Speed Quiz
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
