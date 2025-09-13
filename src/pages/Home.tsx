import { Link } from 'react-router-dom';
import { 
  Pill, 
  Building2, 
  Video, 
  Bot, 
  ArrowRight,
  Shield,
  Clock,
  Users,
  Award,
  Mic,
  Globe,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const services = [
    {
      title: 'Medicine Marketplace',
      description: 'Search and purchase medications from verified local pharmacies',
      icon: Pill,
      color: 'border-l-medical-medicine',
      features: [
        'Compare prices across pharmacies',
        'Check real-time availability',
        'Doorstep delivery service',
        'Prescription verification'
      ],
      buttonText: 'Browse Medicines',
      href: '/medicine'
    },
    {
      title: 'Hospital Booking',
      description: 'Reserve beds and book appointments at top hospitals',
      icon: Building2,
      color: 'border-l-medical-hospital',
      features: [
        'Real-time bed availability',
        'Compare hospital facilities',
        'Secure appointment booking',
        'Insurance verification'
      ],
      buttonText: 'Find Hospitals',
      href: '/hospitals'
    },
    {
      title: 'Doctor Consultation',
      description: 'Connect with certified healthcare professionals online',
      icon: Video,
      color: 'border-l-medical-consultation',
      features: [
        'Video call consultations',
        'Digital prescriptions',
        'Specialist referrals',
        'Medical record sharing'
      ],
      buttonText: 'Consult Doctor',
      href: '/doctors'
    },
    {
      title: 'AI Health Assistant',
      description: 'Get instant health guidance and preliminary assessments',
      icon: Bot,
      color: 'border-l-medical-ai',
      features: [
        'Symptom analysis',
        'Health recommendations',
        'Medical history tracking',
        '24/7 availability'
      ],
      buttonText: 'Ask AI Assistant',
      href: '/ai-assistant'
    }
  ];

  const enhancedFeatures = [
    {
      icon: Mic,
      title: 'Voice-to-Text',
      description: 'Hands-free interaction for easy communication with healthcare providers',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Accessible healthcare services in multiple languages for everyone',
      bgColor: 'bg-green-50'
    },
    {
      icon: Phone,
      title: 'Emergency Assistance',
      description: 'Immediate help and guidance for urgent medical situations',
      bgColor: 'bg-red-50'
    }
  ];

  const stats = [
    { icon: Users, value: '50,000+', label: 'Active Patients' },
    { icon: Award, value: '1,200+', label: 'Certified Doctors' },
    { icon: Shield, value: '99.9%', label: 'Data Security' },
    { icon: Clock, value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Complete
            <br />
            <span className="text-primary">Healthcare Companion</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Medic-AL makes healthcare accessible, convenient, and efficient for everyone. Get 
            comprehensive medical assistance at your fingertips with our innovative platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary-hover">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Four Essential Healthcare Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive medical care through our integrated platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className={`group hover:shadow-hover transition-all duration-300 border-l-4 ${service.color} bg-gradient-card`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {service.buttonText.split(' ')[0]}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {service.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full group-hover:bg-primary-hover transition-colors">
                  <Link to={service.href}>
                    {service.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Enhanced Healthcare Experience
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {enhancedFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex p-6 rounded-full ${feature.bgColor} mb-6`}>
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Medic-AL</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Making healthcare accessible, convenient, and efficient for everyone through innovative 
              technology and user-friendly design.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
              Terms of Service
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
              Contact Support
            </Button>
          </div>
          
          <div className="text-sm text-slate-500">
            © 2024 Medic-AL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;