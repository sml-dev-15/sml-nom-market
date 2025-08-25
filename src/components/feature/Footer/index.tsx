export const Footer = () => {
  return (
    <footer className="bg-background/95 backdrop-blur-sm border-t border-border/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-medium text-foreground">
              SML Nom Market
            </p>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>© 2025</span>
            <span>•</span>
            <span>Made with</span>
            <span className="text-destructive animate-heartbeat">❤️</span>
            <span>by SML</span>
          </p>

          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors text-xs">
              Privacy
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors text-xs">
              Terms
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors text-xs">
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
