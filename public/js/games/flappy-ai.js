(function(){
  const STORAGE_KEY = 'vh-game-flappy-best';

  class FlappyAIGame {
    constructor(root){
      this.root = root;
      this.canvas = document.createElement('canvas');
      this.canvas.width = 900;
      this.canvas.height = 520;
      this.canvas.className = 'game-canvas';
      this.root.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
      this.animationFrame = null;
      this.lastTime = 0;
      this.bindings();
      this.reset();
      this.loop = this.loop.bind(this);
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    bindings(){
      this.handleFlap = (event) => {
        if(event.type === 'keydown' && event.code !== 'Space') return;
        if(event.type === 'keydown') event.preventDefault();

        if(this.state === 'ready'){
          this.state = 'running';
          this.flap();
        }else if(this.state === 'running'){
          this.flap();
        }else if(this.state === 'over'){
          this.reset();
          this.state = 'running';
          this.flap();
        }
      };
      window.addEventListener('keydown', this.handleFlap);
      this.canvas.addEventListener('pointerdown', this.handleFlap);
    }

    reset(){
      this.state = 'ready';
      this.score = 0;
      this.scroll = 0;
      this.spawnTimer = 0;
      this.pipes = [];
      this.player = { x: 170, y: 240, radius: 20, velocity: 0, tilt: 0 };
      this.lastTime = 0;
    }

    flap(){
      this.player.velocity = -420;
      this.player.tilt = -0.6;
    }

    spawnPipe(){
      const gap = 148;
      const minHeight = 70;
      const maxHeight = this.canvas.height - 160 - gap;
      const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
      this.pipes.push({
        x: this.canvas.width + 80,
        width: 76,
        topHeight,
        gap,
        counted: false
      });
    }

    update(delta){
      if(this.state !== 'running') return;

      this.scroll = (this.scroll + 140 * delta) % this.canvas.width;
      this.spawnTimer -= delta;
      if(this.spawnTimer <= 0){
        this.spawnPipe();
        this.spawnTimer = 1.28;
      }

      this.player.velocity += 920 * delta;
      this.player.y += this.player.velocity * delta;
      this.player.tilt = Math.min(1, this.player.tilt + 2.8 * delta);

      this.pipes.forEach(pipe => {
        pipe.x -= 220 * delta;
        if(!pipe.counted && pipe.x + pipe.width < this.player.x){
          pipe.counted = true;
          this.score += 1;
          if(this.score > this.bestScore){
            this.bestScore = this.score;
            localStorage.setItem(STORAGE_KEY, String(this.bestScore));
          }
        }
      });
      this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > -100);

      if(this.player.y - this.player.radius <= 0 || this.player.y + this.player.radius >= this.canvas.height){
        this.endGame();
      }

      for(const pipe of this.pipes){
        const withinX = this.player.x + this.player.radius > pipe.x && this.player.x - this.player.radius < pipe.x + pipe.width;
        const hitTop = this.player.y - this.player.radius < pipe.topHeight;
        const hitBottom = this.player.y + this.player.radius > pipe.topHeight + pipe.gap;
        if(withinX && (hitTop || hitBottom)){
          this.endGame();
          break;
        }
      }
    }

    endGame(){
      if(this.state === 'over') return;
      this.state = 'over';
      if(this.score > this.bestScore){
        this.bestScore = this.score;
        localStorage.setItem(STORAGE_KEY, String(this.bestScore));
      }
    }

    drawBackground(){
      const ctx = this.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#14071f');
      gradient.addColorStop(1, '#05000d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.strokeStyle = 'rgba(192,132,252,0.08)';
      for(let x = -this.scroll; x < this.canvas.width + 60; x += 60){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
      }
    }

    drawPipes(){
      const ctx = this.ctx;
      this.pipes.forEach(pipe => {
        ctx.fillStyle = '#7b42c8';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + pipe.gap, pipe.width, this.canvas.height - pipe.topHeight - pipe.gap);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(pipe.x - 6, pipe.topHeight - 18, pipe.width + 12, 18);
        ctx.fillRect(pipe.x - 6, pipe.topHeight + pipe.gap, pipe.width + 12, 18);
      });
    }

    drawDrone(){
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      ctx.rotate(this.player.tilt);
      ctx.strokeStyle = 'rgba(236,229,251,0.92)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#7c41ca';
      roundedRect(ctx, -10, -28, 20, 56, 10);
      ctx.fill();

      ctx.fillStyle = '#ece5fb';
      roundedRect(ctx, -18, -10, 36, 20, 10);
      ctx.fill();

      ctx.fillStyle = '#58a6ff';
      ctx.beginPath();
      ctx.ellipse(-5, 0, 5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(5, 0, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-34, 0);
      ctx.lineTo(-18, 0);
      ctx.moveTo(18, 0);
      ctx.lineTo(34, 0);
      ctx.moveTo(0, -36);
      ctx.lineTo(0, -28);
      ctx.moveTo(0, 28);
      ctx.lineTo(0, 36);
      ctx.stroke();
      ctx.restore();
    }

    drawHud(){
      const ctx = this.ctx;
      ctx.fillStyle = '#f2ecfb';
      ctx.font = "600 18px 'Barlow', sans-serif";
      ctx.fillText(`Score ${this.score}`, 28, 38);
      ctx.fillText(`Best ${this.bestScore}`, 28, 64);
      if(this.state === 'ready' || this.state === 'over'){
        ctx.fillStyle = 'rgba(6,0,14,0.56)';
        ctx.fillRect(184, 154, 532, 188);
        ctx.strokeStyle = 'rgba(192,132,252,0.32)';
        ctx.strokeRect(184, 154, 532, 188);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = "700 34px 'Orbitron', sans-serif";
        ctx.fillText(this.state === 'ready' ? 'Flappy AI' : 'Drone Down', this.canvas.width / 2, 224);
        ctx.fillStyle = '#d2cae6';
        ctx.font = "400 18px 'Barlow', sans-serif";
        ctx.fillText(
          this.state === 'ready'
            ? 'Space, click, or tap to flap through every obstacle.'
            : `Score ${this.score}. Space, click, or tap to try again.`,
          this.canvas.width / 2,
          266
        );
        ctx.textAlign = 'left';
      }
    }

    loop(timestamp){
      if(!this.lastTime) this.lastTime = timestamp;
      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.032);
      this.lastTime = timestamp;
      this.update(delta);
      this.drawBackground();
      this.drawPipes();
      this.drawDrone();
      this.drawHud();
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    destroy(){
      cancelAnimationFrame(this.animationFrame);
      window.removeEventListener('keydown', this.handleFlap);
      this.canvas.removeEventListener('pointerdown', this.handleFlap);
    }
  }

  function roundedRect(ctx, x, y, width, height, radius){
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  window.VHGames.registerGame('flappy-ai', FlappyAIGame);
})();
