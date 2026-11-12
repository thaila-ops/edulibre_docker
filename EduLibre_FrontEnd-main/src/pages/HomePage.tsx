import FeaturedLessons from '../components/home/FeaturedLessons';
import HomeAbout from '../components/home/HomeAbout';
import HomeBenefits from '../components/home/HomeBenefits';
import HomeCallToAction from '../components/home/HomeCallToAction';
import HomeHero from '../components/home/HomeHero';
import HomeSteps from '../components/home/HomeSteps';
import useFeaturedLessons from '../hooks/useFeaturedLessons';
import './home.css';

export default function HomePage() {
  const lessons = useFeaturedLessons();

  return (
    <main className="home">
      <HomeHero />
      <HomeBenefits />
      <HomeAbout />
      <div className="home_bottom">
        <FeaturedLessons lessons={lessons} variant="teachers" />
        <FeaturedLessons lessons={lessons} variant="lessons" />
        <HomeSteps />
        <HomeCallToAction />
      </div>
    </main>
  );
}
