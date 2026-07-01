(function(){
  const namespace = window.VHGames = window.VHGames || {
    classes: {},
    registerGame(id, GameClass){
      this.classes[id] = GameClass;
    }
  };

  class GamesModalManager {
    constructor(){
      this.modal = document.getElementById('games-modal');
      this.backdrop = document.getElementById('games-modal-backdrop');
      this.closeButton = document.getElementById('games-modal-close');
      this.title = document.getElementById('games-modal-title');
      this.description = document.getElementById('games-modal-description');
      this.container = document.getElementById('games-modal-game');
      this.instance = null;
      this.currentId = null;
      this.scrollY = 0;

      if(!this.modal || !this.container) return;

      this.handleKeydown = this.handleKeydown.bind(this);
      this.close = this.close.bind(this);
      this.handleDismiss = this.handleDismiss.bind(this);
      this.handleModalPointer = this.handleModalPointer.bind(this);

      this.closeButton?.addEventListener('click', this.handleDismiss);
      this.closeButton?.addEventListener('pointerdown', this.handleDismiss);
      this.backdrop?.addEventListener('click', this.handleDismiss);
      this.backdrop?.addEventListener('pointerdown', this.handleDismiss);
      this.modal?.addEventListener('click', this.handleModalPointer);
      this.modal?.addEventListener('pointerdown', this.handleModalPointer);
      document.addEventListener('keydown', this.handleKeydown);
    }

    handleKeydown(event){
      if(event.key === 'Escape' && this.modal?.classList.contains('active')){
        this.close();
      }
    }

    handleDismiss(event){
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.close();
    }

    handleModalPointer(event){
      const dismissTrigger = event.target.closest('#games-modal-close, #games-modal-backdrop');
      if(!dismissTrigger) return;
      this.handleDismiss(event);
    }

    lockScroll(){
      this.scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }

    unlockScroll(){
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, this.scrollY);
    }

    open(gameConfig){
      if(!this.modal || !this.container) return;
      const GameClass = namespace.classes[gameConfig.id];
      if(!GameClass) return;

      if(this.instance && typeof this.instance.destroy === 'function'){
        this.instance.destroy();
      }

      this.currentId = gameConfig.id;
      this.title.textContent = gameConfig.title;
      this.description.textContent = gameConfig.description;
      this.container.innerHTML = '';
      this.lockScroll();
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
      try{
        this.instance = new GameClass(this.container, gameConfig);
      }catch(error){
        console.error(`Failed to open ${gameConfig.id}`, error);
        this.container.innerHTML = '<div class="game-error">Game failed to load. Please try again.</div>';
        this.instance = null;
        return;
      }
      if(typeof this.instance.focus === 'function'){
        this.instance.focus();
      }
    }

    close(){
      if(!this.modal) return;
      if(this.instance && typeof this.instance.destroy === 'function'){
        this.instance.destroy();
      }
      this.instance = null;
      this.currentId = null;
      this.container.innerHTML = '';
      this.modal.classList.remove('active');
      this.modal.setAttribute('aria-hidden', 'true');
      this.unlockScroll();
    }
  }

  namespace.modal = new GamesModalManager();
})();
