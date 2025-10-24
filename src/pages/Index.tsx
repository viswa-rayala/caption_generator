import { CaptionGenerator } from "@/components/CaptionGenerator";
import heroImage from "@/assets/hero-travel.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        </div>
        
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            AI Travel Caption Generator
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
            Transform your travel moments into captivating captions with the power of AI
          </p>
        </div>
      </section>

      {/* Generator Section */}
      <section className="relative -mt-16">
        <CaptionGenerator />
      </section>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-muted-foreground">
        <p>Made with ❤️ for travelers around the world</p>
      </footer>
    </div>
  );
};

export default Index;
