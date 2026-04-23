import './UserLanding.css';
import Navbar from '../components/UserLanding/Navbar';
import Hero from '../components/UserLanding/Hero';
import ScheduleCalendar from '../components/UserLanding/ScheduleCalendar';
import About from '../components/UserLanding/About';
import Features from '../components/UserLanding/Features';
import Modules from '../components/UserLanding/Modules';
import CTA from '../components/UserLanding/CTA';
import Footer from '../components/UserLanding/Footer';

const UserLanding = () => {
  return (
    <div className="user-landing-page">
      <Navbar />
      <Hero />
      <ScheduleCalendar />
      <About />
      <Features />
      <Modules />
      <CTA />
      <Footer />
    </div>
  );
};

export default UserLanding;
