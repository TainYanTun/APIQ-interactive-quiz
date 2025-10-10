'use client';

import { useEffect, useState, useCallback } from 'react';

interface Question {
  id: number;
  text: string;
  answer: string;
  category: string;
  difficulty: number;
  round: number;
  topic: string;
  question_type: string;
  options: string | null;
  created_at: string;
  is_active: number;
}

const categories = [
  'General Knowledge',
  'English',
  'Math',
  'Social Study',
  'IT'
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    answer: '',
    category: 'General Knowledge',
    difficulty: 1,
    round: 1,
    topic: 'General',
    question_type: 'text',
    options: ''
  });

  const fetchQuestions = useCallback(async () => {
    const url = selectedCategory === 'all' 
      ? '/api/questions' 
      : `/api/questions?category=${encodeURIComponent(selectedCategory)}`;
    
    try {
      const res = await fetch(url);
      const responseData = await res.json();

      if (res.ok) {
        setQuestions(responseData.data || []); // Access the 'data' property
      } else {
        console.error('Error fetching questions:', responseData);
        setQuestions([]); // Ensure questions is an empty array on error
        alert(`Failed to fetch questions: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network or parsing error fetching questions:', error);
      setQuestions([]); // Ensure questions is an empty array on network/parsing error
      alert('Failed to fetch questions due to a network error.');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const res = await fetch('/api/questions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchQuestions();
      }
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      text: question.text,
      answer: question.answer,
      category: question.category,
      difficulty: question.difficulty,
      round: question.round,
      topic: question.topic,
      question_type: question.question_type,
      options: question.options || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data with proper options handling
    const questionData = {
      ...newQuestion,
      // Only include options if it's not empty and for multiple choice questions
      options: (newQuestion.question_type === 'multiple_choice' && newQuestion.options.trim() !== '') 
        ? newQuestion.options.trim() 
        : null
    };
    
    const url = editingQuestion ? '/api/questions/update' : '/api/questions';
    const method = editingQuestion ? 'PUT' : 'POST';
    const body = editingQuestion 
      ? { ...questionData, id: editingQuestion.id }
      : questionData;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchQuestions();
      setShowModal(false);
      setEditingQuestion(null);
      setNewQuestion({
        text: '',
        answer: '',
        category: 'General Knowledge',
        difficulty: 1,
        round: 1,
        topic: 'General',
        question_type: 'text',
        options: ''
      });
    } else {
      const error = await res.json();
      alert(`Failed to ${editingQuestion ? 'update' : 'add'} question: ${error.message}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setNewQuestion({
      text: '',
      answer: '',
      category: 'General Knowledge',
      difficulty: 1,
      round: 1,
      topic: 'General',
      question_type: 'text',
      options: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
        <p className="text-gray-600">Manage your quiz questions here.</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Question Library</h2>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Question
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={question.text}>
                        {question.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={question.answer}>
                        {question.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.difficulty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.question_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(question)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(question.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {questions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found for the selected category.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                      rows={3}
                      required
                      placeholder="Enter the question text..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                      rows={2}
                      required
                      placeholder="Enter the correct answer..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        value={newQuestion.difficulty}
                        onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value={1}>Easy (1)</option>
                        <option value={2}>Medium (2)</option>
                        <option value={3}>Hard (3)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.round}
                        onChange={(e) => setNewQuestion({ ...newQuestion, round: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                      <select
                        value={newQuestion.question_type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setNewQuestion({ 
                            ...newQuestion, 
                            question_type: newType,
                            // Clear options if not multiple choice
                            options: newType === 'multiple_choice' ? newQuestion.options : ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={newQuestion.topic}
                      onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter topic (optional)"
                    />
                  </div>

                  {newQuestion.question_type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Options (JSON format)</label>
                      <textarea
                        value={newQuestion.options}
                        onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder='["Option A", "Option B", "Option C", "Option D"]'
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="submit" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}