(function(){
  const GAMES = [
    {
      id: 'dino-run',
      title: 'Dino Run',
      description: 'An endless runner inspired by the Chrome offline game.',
      difficulty: 'Medium'
    },
    {
      id: 'flappy-ai',
      title: 'Flappy AI',
      description: 'Guide an autonomous drone through endless obstacles.',
      difficulty: 'Hard'
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'A modern version of the classic arcade game.',
      difficulty: 'Flexible'
    }
  ];

  function openGameById(gameId){
    const config = GAMES.find(game => game.id === gameId);
    if(config && window.VHGames && window.VHGames.modal){
      window.VHGames.modal.open(config);
    }
  }

  function initGames(){
    const section = document.getElementById('playground');
    if(!section || !window.VHGames || !window.VHGames.modal) return;

    section.addEventListener('click', (event) => {
      const button = event.target.closest('.games-play-button');
      if(!button) return;
      openGameById(button.getAttribute('data-game'));
    });

    section.addEventListener('pointerdown', (event) => {
      const button = event.target.closest('.games-play-button');
      if(!button) return;
      event.preventDefault();
    });
  }

  window.openVivGame = openGameById;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initGames);
  }else{
    initGames();
  }
})();
