import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Background } from './components/Background';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { GamesHub } from './pages/GamesHub';
import { Certificate } from './pages/Certificate';

import { PasswordTorture } from './games/PasswordTorture';
import { DeleteAccountPachinko } from './games/DeleteAccountPachinko';
import { FlagPainter } from './games/FlagPainter';
import { SuccessExe } from './games/SuccessExe';
import { PhoneNumberCalculator } from './games/PhoneNumberCalculator';
import { UnsubscribeWindTunnel } from './games/UnsubscribeWindTunnel';
import { BirthdayInPi } from './games/BirthdayInPi';
import { CatchMeIfYouCan } from './games/CatchMeIfYouCan';
import { RandomizedVolume } from './games/RandomizedVolume';
import { EmojiEarCovering } from './games/EmojiEarCovering';
import { SlipperySlider } from './games/SlipperySlider';
import { ComplexNumberVolume } from './games/ComplexNumberVolume';
import { VolumeStamina } from './games/VolumeStamina';
import { MilkGlassVolume } from './games/MilkGlassVolume';
import { AccelerometerMarble } from './games/AccelerometerMarble';
import { OrchestraConductor } from './games/OrchestraConductor';
import { ArtilleryKeyboard } from './games/ArtilleryKeyboard';
import { CraneClawsTyping } from './games/CraneClawsTyping';
import { QrPixelPainter } from './games/QrPixelPainter';
import { ExplodingBalloonLoading } from './games/ExplodingBalloonLoading';
import { ShufflingKeyboard } from './games/ShufflingKeyboard';

import { OrbitalDate } from './games/OrbitalDate';
import { OrbitingDateRoulette } from './games/OrbitingDateRoulette';

function App() {
  return (
    <Router>
      <Background />
      <Navbar />
      
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/games" element={<GamesHub />} />
          
          <Route path="/games/orbital-date" element={<OrbitalDate />} />
          <Route path="/games/orbiting-date-roulette" element={<OrbitingDateRoulette />} />
          
          <Route path="/certificate" element={<Certificate />} />
          
          <Route path="/games/password-torture" element={<PasswordTorture />} />
          <Route path="/games/delete-account-pachinko" element={<DeleteAccountPachinko />} />
          <Route path="/games/flag-painter" element={<FlagPainter />} />
          <Route path="/games/success-exe" element={<SuccessExe />} />
          <Route path="/games/phone-number-calculator" element={<PhoneNumberCalculator />} />
          <Route path="/games/unsubscribe-wind-tunnel" element={<UnsubscribeWindTunnel />} />
          <Route path="/games/birthday-in-pi" element={<BirthdayInPi />} />
          <Route path="/games/catch-me" element={<CatchMeIfYouCan />} />
          <Route path="/games/randomized-volume" element={<RandomizedVolume />} />
          <Route path="/games/emoji-ear-covering" element={<EmojiEarCovering />} />
          <Route path="/games/slippery-slider" element={<SlipperySlider />} />
          <Route path="/games/complex-number-volume" element={<ComplexNumberVolume />} />
          <Route path="/games/volume-stamina" element={<VolumeStamina />} />
          <Route path="/games/milk-glass-volume" element={<MilkGlassVolume />} />
          <Route path="/games/accelerometer-marble" element={<AccelerometerMarble />} />
          <Route path="/games/orchestra-conductor" element={<OrchestraConductor />} />
          <Route path="/games/artillery-keyboard" element={<ArtilleryKeyboard />} />
          <Route path="/games/crane-claws-typing" element={<CraneClawsTyping />} />
          <Route path="/games/qr-pixel-painter" element={<QrPixelPainter />} />
          <Route path="/games/exploding-balloon-loading" element={<ExplodingBalloonLoading />} />
          <Route path="/games/shuffling-keyboard" element={<ShufflingKeyboard />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
