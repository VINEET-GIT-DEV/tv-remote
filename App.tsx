import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Power, VolumeX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  ArrowLeft, Home, Mic, Settings, Tv, Wifi,
  Keyboard, MousePointer2, Check, X, Plus, Minus,
  Search, Loader2, Delete
} from 'lucide-react';

const vibrate = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(40);
  }
};

const IconButton = ({ icon: Icon, onClick, className = "", variant = "default", size = 24, label = "" }) => {
  const baseStyle = "flex flex-col items-center justify-center rounded-full active:scale-90 transition-all select-none";
  const variants = {
    default: "bg-neutral-800 text-neutral-200 shadow-lg border border-neutral-700/50 hover:bg-neutral-700",
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50",
    flat: "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"
  };

  const handlePress = (e) => {
    vibrate();
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handlePress}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      aria-label={label}
    >
      <Icon size={size} />
    </button>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button 
    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${checked ? 'bg-green-500' : 'bg-neutral-600'}`}
    onClick={() => { vibrate(); onChange(!checked); }}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const DPad = ({ onButtonPress }) => {
  return (
    <div className="relative w-72 h-72 mx-auto my-2 select-none">
      <div className="absolute inset-0 bg-neutral-800/40 rounded-full border border-neutral-700/50 shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)]"></div>
      
      <button 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-20 flex items-start justify-center pt-3 text-neutral-400 hover:text-white active:bg-neutral-700/40 rounded-t-full transition-colors z-10" 
        onClick={() => { vibrate(); onButtonPress('UP'); }}
      >
        <ChevronUp size={40} />
      </button>
      <button 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-20 flex items-end justify-center pb-3 text-neutral-400 hover:text-white active:bg-neutral-700/40 rounded-b-full transition-colors z-10" 
        onClick={() => { vibrate(); onButtonPress('DOWN'); }}
      >
        <ChevronDown size={40} />
      </button>
      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-36 flex items-center justify-start pl-3 text-neutral-400 hover:text-white active:bg-neutral-700/40 rounded-l-full transition-colors z-10" 
        onClick={() => { vibrate(); onButtonPress('LEFT'); }}
      >
        <ChevronLeft size={40} />
      </button>
      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-36 flex items-center justify-end pr-3 text-neutral-400 hover:text-white active:bg-neutral-700/40 rounded-r-full transition-colors z-10" 
        onClick={() => { vibrate(); onButtonPress('RIGHT'); }}
      >
        <ChevronRight size={40} />
      </button>
      
      <button 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-neutral-800 rounded-full shadow-xl border border-neutral-600/30 flex items-center justify-center text-neutral-200 font-bold text-xl active:scale-95 transition-all hover:bg-neutral-700 z-20" 
        onClick={() => { vibrate(); onButtonPress('OK'); }}
      >
        OK
      </button>
    </div>
  );
};

const Touchpad = ({ onButtonPress }) => {
  const [touchState, setTouchState] = useState('idle');
  const touchData = useRef({
    lastX: 0, lastY: 0,
    fingers: 0,
    hasSwiped: false,
    startTime: 0
  });

  const handleTouchStart = (e) => {
    setTouchState('active');
    const touches = e.touches;
    touchData.current.fingers = touches.length;
    touchData.current.hasSwiped = false;
    touchData.current.startTime = Date.now();

    if (touches.length === 1) {
      touchData.current.lastX = touches[0].clientX;
      touchData.current.lastY = touches[0].clientY;
    } else if (touches.length === 2) {
      touchData.current.lastX = (touches[0].clientX + touches[1].clientX) / 2;
      touchData.current.lastY = (touches[0].clientY + touches[1].clientY) / 2;
    }
  };

  const handleTouchMove = (e) => {
    const touches = e.touches;
    const data = touchData.current;
    
    if (touches.length !== data.fingers) return;

    let currentX = 0;
    let currentY = 0;

    if (touches.length === 1) {
      currentX = touches[0].clientX;
      currentY = touches[0].clientY;
    } else if (touches.length === 2) {
      currentX = (touches[0].clientX + touches[1].clientX) / 2;
      currentY = (touches[0].clientY + touches[1].clientY) / 2;
    } else {
      return;
    }

    const deltaX = currentX - data.lastX;
    const deltaY = currentY - data.lastY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const THRESHOLD = 40;

    if (absX > THRESHOLD || absY > THRESHOLD) {
      data.hasSwiped = true;
      if (absX > absY) {
        onButtonPress(touches.length === 2 ? (deltaX > 0 ? 'SCROLL_RIGHT' : 'SCROLL_LEFT') : (deltaX > 0 ? 'RIGHT' : 'LEFT'));
      } else {
        onButtonPress(touches.length === 2 ? (deltaY > 0 ? 'SCROLL_DOWN' : 'SCROLL_UP') : (deltaY > 0 ? 'DOWN' : 'UP'));
      }
      data.lastX = currentX;
      data.lastY = currentY;
      vibrate();
    }
  };

  const handleTouchEnd = (e) => {
    setTouchState('idle');
    const data = touchData.current;
    if (!data.hasSwiped && (Date.now() - data.startTime) < 300 && data.fingers === 1) {
      vibrate();
      onButtonPress('OK');
    }
    data.fingers = e.touches.length;
  };

  const handleMouseDown = (e) => {
    setTouchState('active');
    touchData.current.fingers = 1;
    touchData.current.hasSwiped = false;
    touchData.current.startTime = Date.now();
    touchData.current.lastX = e.clientX;
    touchData.current.lastY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (touchState !== 'active') return;
    const data = touchData.current;
    const deltaX = e.clientX - data.lastX;
    const deltaY = e.clientY - data.lastY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const THRESHOLD = 40;

    if (absX > THRESHOLD || absY > THRESHOLD) {
      data.hasSwiped = true;
      if (absX > absY) {
        onButtonPress(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onButtonPress(deltaY > 0 ? 'DOWN' : 'UP');
      }
      data.lastX = e.clientX;
      data.lastY = e.clientY;
      vibrate();
    }
  };

  const handleMouseUp = () => {
    if (touchState === 'active') {
      setTouchState('idle');
      const data = touchData.current;
      if (!data.hasSwiped && (Date.now() - data.startTime) < 300) {
        vibrate();
        onButtonPress('OK');
      }
    }
  };

  return (
    <div className="w-full px-6 my-2">
      <div 
        className={`w-full h-72 rounded-3xl border shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-center touch-none transition-colors duration-200 ${
          touchState === 'active' ? 'bg-neutral-700/60 border-neutral-500/50' : 'bg-neutral-800/40 border-neutral-700/50'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="text-center opacity-40 pointer-events-none">
          <MousePointer2 size={32} className="mx-auto mb-2" />
          <span className="text-sm font-medium">Swipe to navigate<br/>Two fingers to scroll<br/>Tap to select</span>
        </div>
      </div>
    </div>
  );
};

const PinPad = ({ onInput, onDelete }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'DEL'];
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mx-auto mt-4">
      {numbers.map((num, idx) => (
        num === '' ? <div key={idx} /> :
        <button
          key={idx}
          onClick={() => { vibrate(); num === 'DEL' ? onDelete() : onInput(num); }}
          className="h-16 rounded-full bg-neutral-800/60 flex items-center justify-center text-2xl font-medium text-neutral-200 active:scale-95 active:bg-neutral-700 transition-all border border-neutral-700/30 shadow-sm"
        >
          {num === 'DEL' ? <Delete size={28} /> : num}
        </button>
      ))}
    </div>
  );
};

const KeyboardOverlay = ({ isOpen, onClose, onType }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-0 left-0 right-0 bg-neutral-900 border-b border-neutral-800 p-4 z-40 flex items-center shadow-2xl pt-8"
    >
      <input 
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onType(e.target.value);
        }}
        placeholder="Type to search on TV..."
        className="flex-1 bg-neutral-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        onClick={() => { vibrate(); onClose(); setText(''); }}
        className="ml-3 p-3 text-neutral-400 hover:text-white active:scale-95 transition-transform"
      >
        <X size={24} />
      </button>
    </motion.div>
  );
};

const SettingsScreen = ({ onClose, onDisconnect, activeDevice, inputMode, setInputMode }) => {
  const [haptic, setHaptic] = useState(true);
  const [smoothPress, setSmoothPress] = useState(true);
  const [keepAwake, setKeepAwake] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
      className="absolute inset-0 bg-[#121212] z-50 flex flex-col"
    >
      <div className="flex items-center px-4 py-4 border-b border-neutral-800 bg-[#121212]">
        <IconButton icon={ArrowLeft} variant="ghost" onClick={onClose} className="w-10 h-10 mr-2" />
        <h2 className="text-xl font-medium">Settings</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="px-6 py-6">
          
          <h3 className="text-neutral-400 font-medium mb-6 uppercase tracking-wider text-sm">Input Mode</h3>
          <div className="flex space-x-4 mb-8">
            <button 
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${inputMode === 'dpad' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-700'}`}
              onClick={() => { vibrate(); setInputMode('dpad'); }}
            >
              D-Pad
            </button>
            <button 
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${inputMode === 'touchpad' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-700'}`}
              onClick={() => { vibrate(); setInputMode('touchpad'); }}
            >
              Touchpad
            </button>
          </div>

          <div className="h-px bg-neutral-800 my-6"></div>

          <h3 className="text-neutral-400 font-medium mb-6 uppercase tracking-wider text-sm">Remote behavior</h3>
          
          <div className="mb-8 flex justify-between items-start">
            <div className="pr-6">
              <h4 className="text-lg font-medium mb-1">Haptic Feedback</h4>
              <p className="text-sm text-neutral-500 leading-snug">A light vibration feedback when remote buttons are pressed</p>
            </div>
            <div className="pt-1"><Toggle checked={haptic} onChange={setHaptic} /></div>
          </div>

          <div className="mb-8 flex justify-between items-start">
            <div className="pr-6">
              <h4 className="text-lg font-medium mb-1">Smooth Press</h4>
              <p className="text-sm text-neutral-500 leading-snug">Try to mimic physical remote natural behavior when you Press and Hold volume, channel and navigation keys</p>
            </div>
            <div className="pt-1"><Toggle checked={smoothPress} onChange={setSmoothPress} /></div>
          </div>

          <div className="mb-8 flex justify-between items-start">
            <div className="pr-6">
              <h4 className="text-lg font-medium mb-1">Keep Screen Awake</h4>
              <p className="text-sm text-neutral-500 leading-snug">Your screen will stay on while using the remote so you don't need to keep unlocking it</p>
            </div>
            <div className="pt-1"><Toggle checked={keepAwake} onChange={setKeepAwake} /></div>
          </div>

          <div className="mb-8 flex justify-between items-start">
            <div className="pr-6">
              <h4 className="text-lg font-medium mb-1">Theater Mode</h4>
              <p className="text-sm text-neutral-500 leading-snug">Dims the screen when idle to save battery and reduce glare while watching TV</p>
            </div>
            <div className="pt-1"><Toggle checked={theaterMode} onChange={setTheaterMode} /></div>
          </div>

          <div className="h-px bg-neutral-800 my-6"></div>

          <h3 className="text-neutral-400 font-medium mb-6 uppercase tracking-wider text-sm">Connection</h3>

          <div className="bg-neutral-800/50 rounded-2xl p-4 flex items-center justify-between border border-neutral-700/30 mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                <Tv size={24} />
              </div>
              <div>
                <h3 className="font-medium">{activeDevice?.name || 'Android TV'}</h3>
                <p className="text-sm text-neutral-400">{activeDevice?.ip || '192.168.1.105'}</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-full text-sm font-medium transition-colors text-white"
              onClick={() => {
                vibrate();
                onClose();
                setTimeout(onDisconnect, 200);
              }}
            >
              Disconnect
            </button>
          </div>

          <button 
            className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 rounded-2xl font-medium transition-colors border border-neutral-700/30 text-neutral-300"
            onClick={() => {
              vibrate();
              onClose();
              setTimeout(onDisconnect, 200);
            }}
          >
            Find New Devices
          </button>

        </div>
      </div>
    </motion.div>
  );
};

const RemoteUI = ({ activeDevice, onDisconnect }) => {
  const [inputMode, setInputMode] = useState('dpad');
  const [showSettings, setShowSettings] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleButtonPress = useCallback((buttonId) => {
    console.log(`Pressed: ${buttonId}`);
  }, []);

  return (
    <div className="h-full flex flex-col w-full relative">
      <AnimatePresence>
        {isKeyboardOpen && (
          <KeyboardOverlay 
            isOpen={isKeyboardOpen} 
            onClose={() => setIsKeyboardOpen(false)} 
            onType={(text) => console.log("Typing to TV:", text)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800/50 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">{activeDevice?.name || 'Android TV'}</h1>
            <p className="text-xs text-neutral-400">Connected</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <IconButton icon={Keyboard} variant="ghost" size={20} className="w-10 h-10" onClick={() => setIsKeyboardOpen(true)} />
          <IconButton icon={Settings} variant="ghost" size={20} className="w-10 h-10" onClick={() => setShowSettings(true)} />
        </div>
      </header>

      {/* Main Remote Area */}
      <main className="flex-1 flex flex-col justify-between pb-6 pt-2 overflow-hidden">
        {/* Top Controls */}
        <div className="flex justify-between items-center px-8">
          <IconButton icon={Power} variant="danger" className="w-12 h-12" onClick={() => handleButtonPress('POWER')} />
          <IconButton icon={VolumeX} variant="flat" className="w-12 h-12" onClick={() => handleButtonPress('MUTE')} />
        </div>

        {/* Input Area */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {inputMode === 'dpad' && (
              <motion.div key="dpad" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <DPad onButtonPress={handleButtonPress} />
              </motion.div>
            )}
            {inputMode === 'touchpad' && (
              <motion.div key="touchpad" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="w-full">
                <Touchpad onButtonPress={handleButtonPress} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Row */}
        <div className="flex justify-center items-center space-x-6 px-6">
          <IconButton icon={ArrowLeft} className="w-12 h-12" onClick={() => handleButtonPress('BACK')} />
          <IconButton icon={Mic} variant="primary" className="w-14 h-14" size={24} onClick={() => handleButtonPress('VOICE')} />
          <IconButton icon={Home} className="w-12 h-12" onClick={() => handleButtonPress('HOME')} />
        </div>

        {/* Volume & Channel Rockers */}
        <div className="flex justify-between px-10">
          <div className="bg-neutral-800/80 rounded-full w-14 flex flex-col items-center py-1.5 border border-neutral-700/50 shadow-lg">
            <button className="w-full h-14 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700/50 rounded-t-full transition-colors" onClick={() => { vibrate(); handleButtonPress('VOL_UP'); }}>
              <Plus size={20} />
            </button>
            <div className="text-[10px] font-semibold text-neutral-500 py-1 select-none">VOL</div>
            <button className="w-full h-14 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700/50 rounded-b-full transition-colors" onClick={() => { vibrate(); handleButtonPress('VOL_DOWN'); }}>
              <Minus size={20} />
            </button>
          </div>

          <div className="bg-neutral-800/80 rounded-full w-14 flex flex-col items-center py-1.5 border border-neutral-700/50 shadow-lg">
            <button className="w-full h-14 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700/50 rounded-t-full transition-colors" onClick={() => { vibrate(); handleButtonPress('CH_UP'); }}>
              <ChevronUp size={24} />
            </button>
            <div className="text-[10px] font-semibold text-neutral-500 py-1 select-none">CH</div>
            <button className="w-full h-14 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700/50 rounded-b-full transition-colors" onClick={() => { vibrate(); handleButtonPress('CH_DOWN'); }}>
              <ChevronDown size={24} />
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showSettings && (
          <SettingsScreen 
            onClose={() => setShowSettings(false)} 
            onDisconnect={onDisconnect} 
            activeDevice={activeDevice} 
            inputMode={inputMode}
            setInputMode={setInputMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [connectionState, setConnectionState] = useState('scanning'); // scanning, list, pairing, connected
  const [availableDevices, setAvailableDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [pin, setPin] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const startScanning = useCallback(() => {
    setConnectionState('scanning');
    setAvailableDevices([]);
    setActiveDevice(null);
    setPin('');
    setIsConnecting(false);
    
    setTimeout(() => {
      setAvailableDevices([
        { id: 'tv-1', name: 'Living Room TV', model: 'Bravia 4K UR3', ip: '192.168.1.105' },
        { id: 'tv-2', name: 'Bedroom TV', model: 'Chromecast with Google TV', ip: '192.168.1.112' },
        { id: 'tv-3', name: 'Family Room Shield', model: 'NVIDIA SHIELD Android TV', ip: '192.168.1.140' }
      ]);
      setConnectionState('list');
    }, 2500);
  }, []);

  useEffect(() => {
    startScanning();
  }, [startScanning]);

  const handlePinInput = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setIsConnecting(true);
        setTimeout(() => {
          setIsConnecting(false);
          setConnectionState('connected');
          setPin('');
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden flex flex-col max-w-md mx-auto relative shadow-2xl">
      <AnimatePresence mode="wait">
        {connectionState === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }}></div>
              <div className="relative bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                <Search size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Searching for devices</h2>
            <p className="text-neutral-400 leading-relaxed">Make sure your TV is turned on and connected to the same Wi-Fi network.</p>
          </motion.div>
        )}

        {connectionState === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-6 pt-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Select a device</h2>
              <button onClick={() => { vibrate(); startScanning(); }} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors">
                <Search size={20} />
              </button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pb-8">
              {availableDevices.map(device => (
                <button 
                  key={device.id}
                  onClick={() => { vibrate(); setActiveDevice(device); setConnectionState('pairing'); }}
                  className="w-full bg-neutral-800/40 hover:bg-neutral-700/60 border border-neutral-700/50 rounded-3xl p-5 flex items-center space-x-5 transition-all active:scale-[0.98]"
                >
                  <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-400">
                    <Tv size={28} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-lg text-neutral-100 mb-1">{device.name}</h3>
                    <p className="text-sm text-neutral-400">{device.model}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {connectionState === 'pairing' && (
          <motion.div 
            key="pairing"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center pt-12 px-6"
          >
            <div className="w-full flex justify-start mb-4">
              <IconButton icon={ArrowLeft} variant="ghost" onClick={() => { vibrate(); setConnectionState('list'); setPin(''); }} />
            </div>
            
            <div className="bg-blue-500/10 p-5 rounded-full text-blue-400 mb-6">
              <Tv size={40} />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2 text-center">Enter code</h2>
            <p className="text-neutral-400 text-center mb-10 px-4">
              Enter the code displayed on <span className="text-neutral-200 font-medium">{activeDevice?.name}</span>
            </p>
            
            <div className="flex space-x-3 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold transition-all ${
                    pin.length > i 
                      ? 'border-blue-500 text-white bg-blue-500/10' 
                      : pin.length === i 
                        ? 'border-neutral-500 bg-neutral-800/80' 
                        : 'border-neutral-800 bg-neutral-900/50 text-transparent'
                  }`}
                >
                  {pin[i] || ''}
                </div>
              ))}
            </div>
            
            <div className="flex-1 w-full flex flex-col justify-end pb-8">
              {isConnecting ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 space-y-6">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="text-neutral-300 font-medium text-lg">Connecting...</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <PinPad onInput={(n) => handlePinInput(n)} onDelete={() => setPin(pin.slice(0, -1))} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {connectionState === 'connected' && (
          <motion.div 
            key="remote"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col w-full h-full"
          >
            <RemoteUI activeDevice={activeDevice} onDisconnect={startScanning} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
