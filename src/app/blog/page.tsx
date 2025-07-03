'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  MessageCircle,
  Share2
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  tags: string[];
  excerpt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock blog posts data
    const mockPosts: BlogPost[] = [
      {
        id: 'blog_1',
        title: 'Annual General Meeting - January 2024',
        content: `Dear Community Members,

We are pleased to announce our Annual General Meeting (AGM) for 2024. This is an important gathering where we will discuss the past year's achievements, upcoming projects, and budget allocations for the next fiscal year.

**Meeting Details:**
- Date: January 15, 2024
- Time: 10:00 AM - 12:00 PM
- Venue: Community Clubhouse
- Agenda: Financial Review, Upcoming Projects, Committee Elections

**Key Discussion Points:**
1. Financial Report for 2023
2. Infrastructure Improvement Projects
3. Security Enhancement Measures
4. Garden and Landscaping Updates
5. Committee Member Elections

All members are encouraged to attend and participate in the discussions. Your input is valuable for the continued growth and improvement of our community.

Refreshments will be provided. Please confirm your attendance by replying to this announcement.

Best regards,
Community Management Committee`,
        author: 'Community Admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
        tags: ['meeting', 'agm', 'announcement'],
        excerpt: 'Join us for our Annual General Meeting on January 15, 2024, to discuss community updates and upcoming projects.'
      },
      {
        id: 'blog_2',
        title: 'New Security Measures Implemented',
        content: `Dear Residents,

We are happy to inform you about the new security measures that have been implemented to enhance the safety and security of our community.

**New Security Features:**
- 24/7 CCTV monitoring at all entry and exit points
- Biometric access control for the main gate
- Visitor management system with digital check-in
- Enhanced lighting in common areas
- Security patrol rounds every 2 hours

**Access Cards:**
All residents will receive new RFID access cards by the end of this month. Please collect your cards from the management office during working hours (9 AM - 6 PM).

**Visitor Policy:**
- All visitors must register at the gate
- Residents will receive SMS notifications for visitor arrivals
- Temporary access codes available for expected guests
- Delivery personnel will be tracked and monitored

These measures are part of our ongoing commitment to provide a safe and secure environment for all residents and their families.

For any queries regarding the new security system, please contact the management office.

Stay safe!
Security Committee`,
        author: 'Security Committee',
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2023-12-15'),
        isPublished: true,
        tags: ['security', 'safety', 'update'],
        excerpt: 'New security measures including 24/7 CCTV monitoring and biometric access control have been implemented.'
      },
      {
        id: 'blog_3',
        title: 'Community Garden Project Update',
        content: `Dear Green Thumbs and Nature Lovers,

We are excited to share an update on our community garden project that has been flourishing over the past few months.

**Project Highlights:**
- 50+ vegetable plots allocated to interested families
- Organic composting system established
- Rain water harvesting for irrigation
- Monthly gardening workshops
- Herb garden for community use

**Recent Achievements:**
- Harvested over 200 kg of fresh vegetables
- Reduced community waste by 30% through composting
- Created a beautiful green space for relaxation
- Brought neighbors together through shared activities

**Upcoming Events:**
- Harvest Festival - February 20, 2024
- Seed Exchange Program - March 5, 2024
- Gardening Workshop for Kids - March 15, 2024

**How to Get Involved:**
If you're interested in participating in the community garden project, please contact the Garden Committee. We welcome both experienced gardeners and beginners.

Available Services:
- Plot rental for vegetables/flowers
- Gardening tool library
- Free seeds and saplings
- Expert guidance and workshops

Thank you to all the volunteers who have made this project a huge success. Together, we're creating a greener, more sustainable community.

Happy gardening!
Garden Committee`,
        author: 'Garden Committee',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2023-12-01'),
        isPublished: true,
        tags: ['garden', 'environment', 'community'],
        excerpt: 'Our community garden project is thriving with over 200 kg of vegetables harvested and exciting upcoming events.'
      }
    ];

    setPosts(mockPosts);
    setLoading(false);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                <p className="text-xs sm:text-sm text-gray-500">Community News & Updates</p>
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

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Community News & Updates</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Stay informed about the latest happenings in our community
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>5 min read</span>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{post.title}</h2>
                
                {post.excerpt && (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">{post.excerpt}</p>
                )}

                <div className="prose max-w-none text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  {post.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-base sm:text-lg font-semibold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">
                          {paragraph.slice(2, -2)}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="ml-3 sm:ml-4 mb-1 text-sm sm:text-base">
                          {paragraph.slice(2)}
                        </li>
                      );
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return (
                      <p key={index} className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 touch-target">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 touch-target">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 sm:mt-12 bg-blue-50 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Stay Updated</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Subscribe to our newsletter to receive the latest community news and updates directly in your inbox.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium touch-target">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
