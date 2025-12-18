import { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  Video, 
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Send
} from 'lucide-react';
import PageTitle from '@components/common/PageTitle';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add a new player to my team?',
    answer: 'Navigate to your team\'s page, click on "Squad Management", then select "Add Player". You can either add a new player profile or assign an existing player from your age group to the team.',
    category: 'Players'
  },
  {
    id: '2',
    question: 'How do I create a match report?',
    answer: 'Go to the specific match from your team\'s matches page. After the match has been played, click "Add Match Report" and fill in the details including scorers, assists, bookings, and player ratings.',
    category: 'Matches'
  },
  {
    id: '3',
    question: 'Can I share training sessions across multiple teams?',
    answer: 'Yes! Training sessions are stored globally. Create a session in the Training Library and it will be available to all teams and coaches in your club. You can assign any session to your team\'s training schedule.',
    category: 'Training'
  },
  {
    id: '4',
    question: 'How do player abilities get updated?',
    answer: 'Coaches can update player abilities through the player\'s profile page. Go to the player, select "Abilities", and update their ratings. These changes are tracked over time to show progress and development.',
    category: 'Players'
  },
  {
    id: '5',
    question: 'What are development plans and how do I create one?',
    answer: 'Development plans are personalized improvement programs for players. Navigate to a player\'s profile, select "Development Plans", and create a new plan based on their current abilities and areas needing improvement.',
    category: 'Players'
  },
  {
    id: '6',
    question: 'How do I order kits for my team?',
    answer: 'Go to your team\'s page and select "Kit Orders". You can choose from available kit designs, customize if needed, and submit orders for your squad members.',
    category: 'Kits'
  },
  {
    id: '7',
    question: 'Can parents view their child\'s progress?',
    answer: 'Yes, parents linked to a player\'s profile can view their child\'s match reports, training attendance, ability ratings, and development plans through their parent account.',
    category: 'General'
  },
  {
    id: '8',
    question: 'How do I set up a new formation for my team?',
    answer: 'Visit the Formations & Tactics library, create a new formation by specifying player positions and tactical instructions. Once saved, you can assign it to any team for matches or training.',
    category: 'Tactics'
  },
  {
    id: '9',
    question: 'What happens if I forget my password?',
    answer: 'Click "Forgot Password" on the login page. Enter your registered email address and you\'ll receive instructions to reset your password securely.',
    category: 'Account'
  },
  {
    id: '10',
    question: 'How do I receive notifications for match days?',
    answer: 'Go to your profile settings and enable notifications for your followed teams. You can choose to receive updates via email or push notifications when matches are scheduled.',
    category: 'General'
  }
];

const categories = ['All', 'Players', 'Matches', 'Training', 'Kits', 'Tactics', 'Account', 'General'];

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, submit to backend
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle
          title="Help & Support"
          subtitle="Find answers to common questions or get in touch with our support team"
        />

        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              User Guides
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Step-by-step guides for all features
            </p>
            <a href="#guides" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              Browse Guides →
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Video Tutorials
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Watch how to use key features
            </p>
            <a href="#videos" className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">
              Watch Videos →
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Chat with our support team
            </p>
            <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
              Start Chat →
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <div
                  key={faq.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mt-0.5">
                        {faq.category}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 py-4 bg-white dark:bg-gray-800">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No FAQs match your search. Try a different query or contact support.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Support
              </h2>
            </div>

            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Other Ways to Reach Us
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      support@ourgame.com
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Response within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      +44 20 1234 5678
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      Mon-Fri, 9am-5pm GMT
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Documentation</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Browse our detailed docs
                    </p>
                    <a href="#" className="text-purple-600 dark:text-purple-400 text-xs mt-1 hover:underline inline-block">
                      View Documentation →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">
                For urgent issues affecting multiple users or critical functionality, please contact our emergency support line.
              </p>
              <a
                href="tel:+442012345678"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
              >
                Emergency: +44 20 1234 5678
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
