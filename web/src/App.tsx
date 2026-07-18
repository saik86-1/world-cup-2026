import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import TodaysPrediction from "./components/TodaysPrediction";
import TodaysSlate from "./components/TodaysSlate";
import Calendar from "./components/Calendar";
import AccuracyTracker from "./components/AccuracyTracker";
import PowerRankings from "./components/PowerRankings";
import ModelExplainer from "./components/ModelExplainer";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-ink text-white">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <TodaysPrediction />
        <TodaysSlate />
        <Calendar />
        <AccuracyTracker />
        <PowerRankings />
        <ModelExplainer />
      </main>
      <Footer />
    </div>
  );
}
