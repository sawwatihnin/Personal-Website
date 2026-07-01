(function(){
  const STORAGE_KEY = 'vh-game-snake-best';

  class SnakeGame {
    constructor(root){
      this.root = root;
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'snake-shell';

      this.controls = document.createElement('div');
      this.controls.className = 'snake-controls';
      this.controls.innerHTML = `
        <label class="snake-control">
          <span>Difficulty</span>
          <select class="snake-select">
            <option value="easy">Easy</option>
            <option value="normal" selected>Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <div class="snake-help">Arrows or WASD move. P pauses. Space restarts.</div>
      `;

      this.canvas = document.createElement('canvas');
      this.canvas.width = 900;
      this.canvas.height = 520;
      this.canvas.className = 'game-canvas';

      this.wrapper.appendChild(this.controls);
      this.wrapper.appendChild(this.canvas);
      this.root.appendChild(this.wrapper);
      this.ctx = this.canvas.getContext('2d');
      this.select = this.controls.querySelector('.snake-select');
      this.bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
      this.speeds = { easy: 180, normal: 130, hard: 90 };
      this.gridSize = 24;
      this.columns = 30;
      this.rows = 16;
      this.animationFrame = null;
      this.lastTime = 0;
      this.stepAccumulator = 0;
      this.bindings();
      this.reset();
      this.loop = this.loop.bind(this);
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    bindings(){
      this.handleKeydown = (event) => {
        const key = event.key.toLowerCase();
        if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','p',' '].includes(key) || event.code === 'Space'){
          event.preventDefault();
        }

        const directions = {
          arrowup: { x: 0, y: -1 },
          w: { x: 0, y: -1 },
          arrowdown: { x: 0, y: 1 },
          s: { x: 0, y: 1 },
          arrowleft: { x: -1, y: 0 },
          a: { x: -1, y: 0 },
          arrowright: { x: 1, y: 0 },
          d: { x: 1, y: 0 }
        };

        if(directions[key]){
          const next = directions[key];
          if(next.x !== -this.direction.x || next.y !== -this.direction.y){
            this.pendingDirection = next;
            if(this.state === 'ready') this.state = 'running';
          }
        }else if(key === 'p'){
          if(this.state === 'running') this.state = 'paused';
          else if(this.state === 'paused') this.state = 'running';
        }else if(key === ' ' || event.code === 'Space'){
          if(this.state === 'over'){
            this.reset();
            this.state = 'running';
          }else if(this.state === 'ready'){
            this.state = 'running';
          }
        }
      };

      this.handleDifficulty = () => {
        this.reset();
      };

      window.addEventListener('keydown', this.handleKeydown);
      this.select.addEventListener('change', this.handleDifficulty);
    }

    reset(){
      this.state = 'ready';
      this.score = 0;
      this.direction = { x: 1, y: 0 };
      this.pendingDirection = { x: 1, y: 0 };
      this.stepAccumulator = 0;
      const startX = 8;
      const startY = 8;
      this.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
      ];
      this.spawnFood();
    }

    spawnFood(){
      do{
        this.food = {
          x: Math.floor(Math.random() * this.columns),
          y: Math.floor(Math.random() * this.rows)
        };
      }while(this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    update(delta){
      if(this.state !== 'running') return;
      this.stepAccumulator += delta * 1000;
      const stepTime = this.speeds[this.select.value];
      while(this.stepAccumulator >= stepTime){
        this.stepAccumulator -= stepTime;
        this.direction = this.pendingDirection;
        const nextHead = {
          x: this.snake[0].x + this.direction.x,
          y: this.snake[0].y + this.direction.y
        };

        if(
          nextHead.x < 0 || nextHead.x >= this.columns ||
          nextHead.y < 0 || nextHead.y >= this.rows ||
          this.snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)
        ){
          this.state = 'over';
          if(this.score > this.bestScore){
            this.bestScore = this.score;
            localStorage.setItem(STORAGE_KEY, String(this.bestScore));
          }
          return;
        }

        this.snake.unshift(nextHead);
        if(nextHead.x === this.food.x && nextHead.y === this.food.y){
          this.score += 1;
          if(this.score > this.bestScore){
            this.bestScore = this.score;
            localStorage.setItem(STORAGE_KEY, String(this.bestScore));
          }
          this.spawnFood();
        }else{
          this.snake.pop();
        }
      }
    }

    draw(){
      const ctx = this.ctx;
      const width = this.columns * this.gridSize;
      const height = this.rows * this.gridSize;
      const offsetX = (this.canvas.width - width) / 2;
      const offsetY = (this.canvas.height - height) / 2 + 10;

      const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#12061f');
      gradient.addColorStop(1, '#05000d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = 'rgba(192,132,252,0.08)';
      ctx.fillRect(offsetX, offsetY, width, height);
      ctx.strokeStyle = 'rgba(192,132,252,0.2)';
      ctx.strokeRect(offsetX, offsetY, width, height);

      ctx.strokeStyle = 'rgba(192,132,252,0.08)';
      for(let i = 1; i < this.columns; i += 1){
        ctx.beginPath();
        ctx.moveTo(offsetX + i * this.gridSize, offsetY);
        ctx.lineTo(offsetX + i * this.gridSize, offsetY + height);
        ctx.stroke();
      }
      for(let i = 1; i < this.rows; i += 1){
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * this.gridSize);
        ctx.lineTo(offsetX + width, offsetY + i * this.gridSize);
        ctx.stroke();
      }

      const foodX = offsetX + this.food.x * this.gridSize + 4;
      const foodY = offsetY + this.food.y * this.gridSize + 4;
      ctx.fillStyle = '#f06292';
      ctx.beginPath();
      ctx.arc(foodX + 8, foodY + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      this.snake.forEach((segment, index) => {
        const centerX = offsetX + segment.x * this.gridSize + this.gridSize / 2;
        const centerY = offsetY + segment.y * this.gridSize + this.gridSize / 2;
        const radius = index === 0 ? 11 : Math.max(6, 10 - index * 0.2);
        ctx.fillStyle = index === 0 ? '#ede8f5' : '#a76df2';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        if(index > 0){
          const prev = this.snake[index - 1];
          const prevCenterX = offsetX + prev.x * this.gridSize + this.gridSize / 2;
          const prevCenterY = offsetY + prev.y * this.gridSize + this.gridSize / 2;
          ctx.strokeStyle = '#a76df2';
          ctx.lineWidth = radius * 1.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(prevCenterX, prevCenterY);
          ctx.stroke();
        }
      });

      const head = this.snake[0];
      const headX = offsetX + head.x * this.gridSize + this.gridSize / 2;
      const headY = offsetY + head.y * this.gridSize + this.gridSize / 2;
      const dirX = this.direction.x;
      const dirY = this.direction.y;
      const perpX = dirY;
      const perpY = -dirX;
      ctx.fillStyle = '#12061f';
      ctx.beginPath();
      ctx.arc(headX + perpX * 4 + dirX * 1, headY + perpY * 4 + dirY * 1, 2.3, 0, Math.PI * 2);
      ctx.arc(headX - perpX * 4 + dirX * 1, headY - perpY * 4 + dirY * 1, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f06292';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX + dirX * 10, headY + dirY * 10);
      ctx.lineTo(headX + dirX * 16 + perpX * 2, headY + dirY * 16 + perpY * 2);
      ctx.moveTo(headX + dirX * 10, headY + dirY * 10);
      ctx.lineTo(headX + dirX * 16 - perpX * 2, headY + dirY * 16 - perpY * 2);
      ctx.stroke();

      ctx.fillStyle = '#f2ecfb';
      ctx.font = "600 18px 'Barlow', sans-serif";
      ctx.fillText(`Score ${this.score}`, 28, 38);
      ctx.fillText(`Best ${this.bestScore}`, 28, 64);

      if(this.state === 'ready' || this.state === 'paused' || this.state === 'over'){
        ctx.fillStyle = 'rgba(6,0,14,0.56)';
        ctx.fillRect(186, 156, 528, 180);
        ctx.strokeStyle = 'rgba(192,132,252,0.32)';
        ctx.strokeRect(186, 156, 528, 180);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = "700 34px 'Orbitron', sans-serif";
        const title = this.state === 'ready' ? 'Snake' : this.state === 'paused' ? 'Paused' : 'Game Over';
        ctx.fillText(title, this.canvas.width / 2, 224);
        ctx.fillStyle = '#d2cae6';
        ctx.font = "400 18px 'Barlow', sans-serif";
        const copy = this.state === 'ready'
          ? 'Use Arrow keys or WASD to move. P pauses. Space starts.'
          : this.state === 'paused'
            ? 'Press P to continue.'
            : `Final score ${this.score}. Space restarts.`;
        ctx.fillText(copy, this.canvas.width / 2, 266);
        ctx.textAlign = 'left';
      }
    }

    loop(timestamp){
      if(!this.lastTime) this.lastTime = timestamp;
      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.032);
      this.lastTime = timestamp;
      this.update(delta);
      this.draw();
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    destroy(){
      cancelAnimationFrame(this.animationFrame);
      window.removeEventListener('keydown', this.handleKeydown);
      this.select.removeEventListener('change', this.handleDifficulty);
    }
  }

  window.VHGames.registerGame('snake', SnakeGame);
})();
