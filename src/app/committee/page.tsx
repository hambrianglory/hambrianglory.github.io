'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  User,
  Crown,
  Shield,
  Users,
  Settings
} from 'lucide-react';

interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  nicNumber: string;
  dateOfBirth: Date;
  photo?: string;
  startDate: Date;
  endDate?: Date;
  bio?: string;
  responsibilities: string[];
}

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock committee members data
    const mockMembers: CommitteeMember[] = [
      {
        id: 'committee_1',
        name: 'Robert Johnson',
        position: 'President',
        email: 'president@hambrianglory.lk',
        phone: '+94 112 345 681',
        nicNumber: '198512345678',
        dateOfBirth: new Date('1985-04-12'),
        startDate: new Date('2024-01-01'),
        bio: 'Robert has been a dedicated member of our community for over 8 years. With his extensive background in business management and community development, he leads our community initiatives with vision and dedication.',
        responsibilities: [
          'Overall community leadership and strategic planning',
          'Chairing board meetings and community gatherings',
          'Representing the community in external affairs',
          'Coordinating major community projects and initiatives'
        ]
      },
      {
        id: 'committee_2',
        name: 'Sarah Wilson',
        position: 'Vice President',
        email: 'vicepresident@hambrianglory.lk',
        phone: '+94 112 345 682',
        nicNumber: '198712345678',
        dateOfBirth: new Date('1987-09-25'),
        startDate: new Date('2024-01-01'),
        bio: 'Sarah is a passionate advocate for community welfare and environmental sustainability. She has been instrumental in implementing green initiatives and organizing community events.',
        responsibilities: [
          'Supporting the President in leadership duties',
          'Leading environmental and sustainability projects',
          'Organizing community events and celebrations',
          'Managing volunteer coordination and programs'
        ]
      },
      {
        id: 'committee_3',
        name: 'Michael Chen',
        position: 'Treasurer',
        email: 'treasurer@hambrianglory.lk',
        phone: '+94 112 345 683',
        nicNumber: '198912345678',
        dateOfBirth: new Date('1989-11-08'),
        startDate: new Date('2024-01-01'),
        bio: 'Michael brings over 15 years of financial expertise to our community. As a Chartered Accountant, he ensures transparent and efficient management of community finances.',
        responsibilities: [
          'Managing community finances and budgets',
          'Preparing financial reports and statements',
          'Overseeing payment collections and expenses',
          'Ensuring financial compliance and transparency'
        ]
      },
      {
        id: 'committee_4',
        name: 'Dr. Priya Sharma',
        position: 'Secretary',
        email: 'secretary@hambrianglory.lk',
        phone: '+94 112 345 684',
        nicNumber: '199112345678',
        dateOfBirth: new Date('1991-02-14'),
        startDate: new Date('2024-01-01'),
        bio: 'Dr. Priya is a medical professional who joined our committee to improve community health and safety standards. She is known for her excellent organizational skills and attention to detail.',
        responsibilities: [
          'Maintaining meeting minutes and official records',
          'Managing community communications and notices',
          'Coordinating with external service providers',
          'Overseeing health and safety protocols'
        ]
      },
      {
        id: 'committee_5',
        name: 'Rajesh Kumar',
        position: 'Maintenance Head',
        email: 'maintenance@hambrianglory.lk',
        phone: '+94 112 345 685',
        nicNumber: '198712345679',
        dateOfBirth: new Date('1987-05-20'),
        startDate: new Date('2024-01-01'),
        bio: 'Rajesh is an experienced engineer who oversees all maintenance and infrastructure development in our community. His technical expertise ensures our facilities are always in top condition.',
        responsibilities: [
          'Managing community infrastructure and facilities',
          'Coordinating maintenance and repair activities',
          'Planning infrastructure upgrade projects',
          'Supervising utility services and amenities'
        ]
      },
      {
        id: 'committee_6',
        name: 'Lisa Thompson',
        position: 'Security Coordinator',
        email: 'security@hambrianglory.lk',
        phone: '+94 112 345 686',
        nicNumber: '199312345678',
        dateOfBirth: new Date('1993-07-18'),
        startDate: new Date('2024-01-01'),
        bio: 'Lisa is a former security professional who now dedicates her expertise to keeping our community safe. She works closely with security agencies and residents to maintain a secure environment.',
        responsibilities: [
          'Coordinating security operations and protocols',
          'Managing relationships with security personnel',
          'Implementing safety measures and emergency procedures',
          'Conducting security assessments and improvements'
        ]
      }
    ];

    setMembers(mockMembers);
    setLoading(false);
  }, []);

  const getPositionIcon = (position: string) => {
    switch (position.toLowerCase()) {
      case 'president':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'vice president':
        return <Award className="w-6 h-6 text-blue-600" />;
      case 'treasurer':
        return <Settings className="w-6 h-6 text-green-600" />;
      case 'secretary':
        return <User className="w-6 h-6 text-purple-600" />;
      case 'security coordinator':
        return <Shield className="w-6 h-6 text-red-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'president':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vice president':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'treasurer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'secretary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'security coordinator':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative bg-gradient-to-br from-blue-50 to-white rounded-xl p-1.5 sm:p-2 shadow-sm border border-blue-100">
                <Image
                  src="/logo.png"
                  alt="Hambrian Glory Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Hambrian Glory</h1>
                <p className="text-xs sm:text-sm text-gray-500">Committee Members</p>
              </div>
            </div>
            
            <Link
              href="/"
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Community Committee Members</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Meet the dedicated individuals who work tirelessly to make our community 
            a better place to live. Our committee members bring diverse skills and 
            experience to serve the community&apos;s best interests.
          </p>
        </div>

        {/* Committee Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Committee Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Elected Representatives</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Committee members are elected by residents for a term of 2 years
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Volunteer Service</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  All committee positions are voluntary with no compensation
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Transparent Governance</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Regular meetings and financial reports ensure transparency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Committee Members Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{member.name}</h3>
                      {getPositionIcon(member.position)}
                    </div>
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getPositionColor(member.position)}`}>
                      {member.position}
                    </span>
                    <div className="flex items-center space-x-1 mt-2 text-xs sm:text-sm text-gray-500">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Since {member.startDate.getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{member.bio}</p>
                )}

                <div className="mb-4 sm:mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Key Responsibilities:</h4>
                  <ul className="space-y-1 sm:space-y-1.5">
                    {member.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-xs sm:text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-600 rounded-full mt-1.5 sm:mt-2 mr-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Contact Information:</h4>
                  <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 truncate ml-2">{member.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900">{member.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">NIC Number:</span>
                      <span className="text-gray-900">{member.nicNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="text-gray-900">{member.dateOfBirth.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 touch-target"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Email</span>
                      </a>
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 touch-target"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Committee */}
        <div className="mt-8 sm:mt-12 bg-blue-50 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contact the Committee</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
            Have questions, suggestions, or concerns? Our committee members are here to help. 
            Feel free to reach out to any committee member directly or attend our monthly meetings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Monthly Meetings</h4>
              <p className="text-xs sm:text-sm text-gray-600">First Saturday of every month at 10:00 AM</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Committee Office</h4>
              <p className="text-xs sm:text-sm text-gray-600">Community Clubhouse, Ground Floor</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Office Hours</h4>
              <p className="text-xs sm:text-sm text-gray-600">Monday - Saturday, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
