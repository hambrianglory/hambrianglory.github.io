'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Award,
  Shield,
  TreePine,
  Car,
  Dumbbell,
  Wifi,
  Camera,
  Heart
} from 'lucide-react';

export default function AboutPage() {
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
                <p className="text-xs sm:text-sm text-gray-500">About Our Community</p>
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
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">About Hambrian Glory</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            A premium residential community that combines modern living with sustainable practices, 
            creating the perfect environment for families to thrive and grow together.
          </p>
        </div>

        {/* Community Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
              <p>
                Established in 2018, Hambrian Glory was designed with a vision to create 
                a harmonious blend of modern amenities and environmental consciousness. Located 
                in the heart of Sector 15, Gurgaon, our community spans across 25 acres of 
                beautifully landscaped area.
              </p>
              <p>
                What started as a dream to build sustainable homes has evolved into a thriving 
                community of 150+ families who share common values of environmental responsibility, 
                community spirit, and quality living.
              </p>
              <p>
                Our commitment to transparency, efficiency, and resident satisfaction has made 
                us one of the most sought-after residential communities in the region.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">150+</div>
              <div className="text-xs sm:text-sm text-gray-600">Happy Families</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-4" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">6</div>
              <div className="text-xs sm:text-sm text-gray-600">Years Established</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-2 sm:mb-4" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">25</div>
              <div className="text-xs sm:text-sm text-gray-600">Acres of Land</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Award className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-2 sm:mb-4" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h3>
            <p className="text-sm sm:text-base text-gray-600">
              To create a sustainable, secure, and vibrant community where families can live, 
              work, and play in harmony with nature while enjoying modern amenities and 
              transparent governance.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Vision</h3>
            <p className="text-sm sm:text-base text-gray-600">
              To be the benchmark for sustainable community living, fostering strong 
              neighborhoods, environmental stewardship, and quality of life for current 
              and future generations.
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Community Amenities</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Enjoy a wide range of world-class amenities designed to enhance your lifestyle 
              and bring the community together.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">24/7 Security</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Round-the-clock security with CCTV monitoring</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <TreePine className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">Community Garden</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Organic garden and green spaces</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Car className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">Parking</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Covered parking for all residents</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Dumbbell className="w-8 h-8 sm:w-12 sm:h-12 text-red-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">Fitness Center</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Modern gym with latest equipment</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Wifi className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">High-Speed Internet</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Fiber optic connectivity throughout</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">CCTV Surveillance</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Comprehensive security monitoring</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-pink-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">Community Center</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Multipurpose hall for events</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm">Playground</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Safe play area for children</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Prime Location</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Strategically located in Sector 15, Gurgaon, with easy access to major business hubs, 
              schools, hospitals, and shopping centers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Cyber City</h3>
              <p className="text-xs sm:text-sm text-gray-600">Just 10 minutes away from Cyber City business hub</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Metro Connectivity</h3>
              <p className="text-xs sm:text-sm text-gray-600">Direct metro connectivity to Delhi and NCR</p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Shopping & Entertainment</h3>
              <p className="text-xs sm:text-sm text-gray-600">Close to major malls and entertainment centers</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              These values guide our decisions and shape our community culture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Transparency</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Open communication and clear financial reporting in all community matters.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Sustainability</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Committed to environmental responsibility and sustainable living practices.
              </p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Community</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Fostering strong relationships and a sense of belonging among all residents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
