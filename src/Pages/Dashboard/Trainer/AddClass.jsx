import React, { useContext, useState } from 'react';
import { Plus, Image, FileText, Users, Clock, Target, Award, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../../Provider/AuthProvider';

const AddNewClass = () => {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        image: '',
        description: '',
        duration: '',
        difficulty: 'Beginner',
        category: '',
        maxParticipants: '',
        equipment: '',
        prerequisites: '',
        benefits: '',
        schedule: '',
        trainers: []
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const categories = [
        { id: 'HIIT', name: 'HIIT', description: 'High-Intensity Interval Training' },
        { id: 'Yoga', name: 'Yoga', description: 'Flexibility and mindfulness' },
        { id: 'Strength', name: 'Strength Training', description: 'Build muscle and power' },
        { id: 'Cardio', name: 'Cardio', description: 'Cardiovascular fitness' },
        { id: 'Pilates', name: 'Pilates', description: 'Core strength and stability' },
        { id: 'Dance', name: 'Dance Fitness', description: 'Fun rhythmic workouts' },
        { id: 'Boxing', name: 'Boxing', description: 'Combat sports training' },
        { id: 'CrossFit', name: 'CrossFit', description: 'Functional fitness' }
    ];

    const difficultyLevels = [
        { id: 'Beginner', name: 'Beginner', description: 'Perfect for newcomers', color: 'bg-green-100 text-green-800' },
        { id: 'Intermediate', name: 'Intermediate', description: 'Some experience required', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'Advanced', name: 'Advanced', description: 'For experienced athletes', color: 'bg-red-100 text-red-800' },
        { id: 'All Levels', name: 'All Levels', description: 'Suitable for everyone', color: 'bg-blue-100 text-blue-800' }
    ];

    const availableTrainers = [
        'Sarah Johnson', 'Mike Rodriguez', 'Lisa Thompson', 'David Chen', 'Emma Wilson', 'Alex Martinez'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTrainerToggle = (trainer) => {
        setFormData((prev) => ({
            ...prev,
            trainers: prev.trainers.includes(trainer)
                ? prev.trainers.filter((t) => t !== trainer)
                : [...prev.trainers, trainer]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newClass = {
            id: Date.now().toString(),
            ...formData,
            bookings: 0,
            rating: 0,
            createdBy: user?.role || 'admin',
            createdAt: new Date().toISOString()
        };

        const success = addItem('classes', newClass);

        if (success) {
            alert('New class added successfully!');
            setFormData({
                name: '',
                image: '',
                description: '',
                duration: '',
                difficulty: 'Beginner',
                category: '',
                maxParticipants: '',
                equipment: '',
                prerequisites: '',
                benefits: '',
                schedule: '',
                trainers: []
            });
            setCurrentStep(1);
        } else {
            alert('Failed to add class. Please try again.');
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = (step) => {
        switch (step) {
            case 1:
                return formData.name && formData.category && formData.difficulty;
            case 2:
                return formData.description && formData.duration && formData.trainers.length > 0;
            case 3:
                return formData.image;
            default:
                return false;
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Class</h1>
                <p className="text-gray-600">Create an engaging fitness class for your members to enjoy.</p>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step
                                ? 'bg-blue-700 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step}
                            </div>
                            <div className="ml-3">
                                <div className={`font-medium ${currentStep >= step ? 'text-blue-700' : 'text-gray-600'}`}>
                                    {step === 1 && 'Basic Info'}
                                    {step === 2 && 'Details & Trainers'}
                                    {step === 3 && 'Media & Finish'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {step === 1 && 'Name, category, difficulty'}
                                    {step === 2 && 'Description, duration, trainers'}
                                    {step === 3 && 'Images and final review'}
                                </div>
                            </div>
                            {step < 3 && (
                                <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-700' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <Target className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Class Information</h2>
                                <p className="text-gray-600">Let's start with the fundamentals of your class</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Morning Power Yoga, HIIT Bootcamp"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Choose a catchy, descriptive name that attracts members</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Category *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.category === cat.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                        >
                                            <div className="font-medium text-gray-800">{cat.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Difficulty Level *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {difficultyLevels.map((level) => (
                                        <div
                                            key={level.id}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.difficulty === level.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setFormData({ ...formData, difficulty: level.id })}
                                        >
                                            <div className="font-medium text-gray-800">{level.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${level.color}`}>
                                                {level.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Detailed Information */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <FileText className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Details & Trainers</h2>
                                <p className="text-gray-600">Provide comprehensive information about your class</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe what participants can expect, the workout style, and what makes this class special..."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Be detailed and engaging to attract the right participants</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., 45 minutes, 1 hour"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Participants
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="maxParticipants"
                                            value={formData.maxParticipants}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., 20"
                                            min="1"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Assign Trainers * (Select at least one)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableTrainers.map((trainer) => (
                                        <div
                                            key={trainer}
                                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.trainers.includes(trainer)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleTrainerToggle(trainer)}
                                        >
                                            <div className="font-medium text-gray-800 text-sm">{trainer}</div>
                                            {formData.trainers.includes(trainer) && (
                                                <div className="text-xs text-blue-600 mt-1">✓ Selected</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Selected trainers: {formData.trainers.length > 0 ? formData.trainers.join(', ') : 'None'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Equipment Needed
                                </label>
                                <input
                                    type="text"
                                    name="equipment"
                                    value={formData.equipment}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Yoga mat, dumbbells, resistance bands (or 'None' if no equipment needed)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prerequisites
                                </label>
                                <textarea
                                    name="prerequisites"
                                    value={formData.prerequisites}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any requirements or recommendations for participants (e.g., basic fitness level, previous experience)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Benefits
                                </label>
                                <textarea
                                    name="benefits"
                                    value={formData.benefits}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="What will participants gain from this class? (e.g., improved strength, flexibility, stress relief)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Media and Final Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <Image className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Media & Final Review</h2>
                                <p className="text-gray-600">Add visuals and review your class details</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Image URL *
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/class-image.jpg"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Use a high-quality image that represents your class</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Schedule Information
                                </label>
                                <textarea
                                    name="schedule"
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="When will this class be available? (e.g., Mondays and Wednesdays at 7 PM, Daily at 6 AM)"
                                />
                            </div>

                            {/* Preview Section */}
                            {formData.name && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Award className="h-5 w-5 mr-2 text-orange-600" />
                                        Class Preview
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-start space-x-4">
                                            {formData.image && (
                                                <img
                                                    src={formData.image}
                                                    alt={formData.name}
                                                    className="w-32 h-32 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        (e.target).src = 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=200';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="text-xl font-semibold text-gray-800">{formData.name}</h4>
                                                    {formData.difficulty && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyLevels.find(d => d.id === formData.difficulty)?.color
                                                            }`}>
                                                            {formData.difficulty}
                                                        </span>
                                                    )}
                                                </div>
                                                {formData.category && (
                                                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm mb-2">
                                                        {categories.find(c => c.id === formData.category)?.name}
                                                    </span>
                                                )}
                                                <p className="text-gray-600 text-sm mb-3">{formData.description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                    {formData.duration && <span>⏱️ {formData.duration}</span>}
                                                    {formData.maxParticipants && <span>👥 Max {formData.maxParticipants}</span>}
                                                    {formData.equipment && <span>🏋️ {formData.equipment}</span>}
                                                </div>
                                                {formData.trainers.length > 0 && (
                                                    <div className="text-sm text-gray-600">
                                                        <strong>Trainers:</strong> {formData.trainers.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Previous
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStepValid(currentStep)}
                                    className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <span>Next Step</span>
                                    <span>→</span>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Create Class</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Tips for creating a successful class:</p>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Use clear, engaging descriptions that highlight benefits</li>
                                    <li>• Choose appropriate difficulty levels for your target audience</li>
                                    <li>• Include high-quality images that represent the class accurately</li>
                                    <li>• Assign qualified trainers who specialize in this type of workout</li>
                                    <li>• Be specific about equipment and prerequisites</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewClass;