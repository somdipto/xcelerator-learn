
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileQuestion, Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizManager = () => {
  const [quiz, setQuiz] = useState({
    title: '',
    subject: '',
    grade: '',
    timeLimit: 30,
    questions: [] as Question[]
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in the question and all options"
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      ...currentQuestion
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });

    toast({
      title: "Question Added",
      description: "Question has been added to the quiz"
    });
  };

  const removeQuestion = (id: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter(q => q.id !== id)
    });
  };

  const saveQuiz = () => {
    if (!quiz.title || quiz.questions.length === 0) {
      toast({
        title: "Incomplete Quiz",
        description: "Please add a title and at least one question"
      });
      return;
    }

    const quizData = {
      id: Date.now().toString(),
      ...quiz,
      createdAt: new Date().toISOString()
    };

    const existingQuizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
    const updatedQuizzes = [...existingQuizzes, quizData];
    localStorage.setItem('teacherQuizzes', JSON.stringify(updatedQuizzes));
    localStorage.setItem('studentQuizzes', JSON.stringify(updatedQuizzes)); // Sync with student app

    toast({
      title: "Quiz Saved",
      description: `${quiz.title} has been saved successfully`
    });

    setQuiz({
      title: '',
      subject: '',
      grade: '',
      timeLimit: 30,
      questions: []
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Quiz Manager</h1>
        <p className="text-[#E0E0E0]">Create and manage quizzes for your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Details */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#E0E0E0]">Quiz Title</Label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz({...quiz, title: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Chapter 1 Quiz"
              />
            </div>
            <div>
              <Label className="text-[#E0E0E0]">Subject</Label>
              <Input
                value={quiz.subject}
                onChange={(e) => setQuiz({...quiz, subject: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <Label className="text-[#E0E0E0]">Grade</Label>
              <Input
                value={quiz.grade}
                onChange={(e) => setQuiz({...quiz, grade: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <Label className="text-[#E0E0E0]">Time Limit (minutes)</Label>
              <Input
                type="number"
                value={quiz.timeLimit}
                onChange={(e) => setQuiz({...quiz, timeLimit: parseInt(e.target.value)})}
                className="bg-[#121212] border-[#424242] text-white"
              />
            </div>
            <Button
              onClick={saveQuiz}
              className="w-full bg-[#00E676] hover:bg-[#00E676]/90 text-black"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Add Question */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#E0E0E0]">Question</Label>
              <Textarea
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="Enter your question here..."
              />
            </div>
            {currentQuestion.options.map((option, index) => (
              <div key={index}>
                <Label className="text-[#E0E0E0]">Option {index + 1}</Label>
                <div className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({...currentQuestion, options: newOptions});
                    }}
                    className="bg-[#121212] border-[#424242] text-white"
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                    variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                    size="sm"
                    className={currentQuestion.correctAnswer === index ? 
                      "bg-[#00E676] text-black" : 
                      "border-[#424242] text-[#E0E0E0]"
                    }
                  >
                    ✓
                  </Button>
                </div>
              </div>
            ))}
            <Button
              onClick={addQuestion}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Questions ({quiz.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="bg-[#121212] p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">Q{index + 1}</h4>
                      <p className="text-sm text-[#E0E0E0] mb-2">{question.question}</p>
                      <p className="text-xs text-[#00E676]">
                        Correct: {question.options[question.correctAnswer]}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeQuestion(question.id)}
                      size="icon"
                      variant="ghost"
                      className="text-[#FF7043] hover:bg-[#FF7043]/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizManager;
