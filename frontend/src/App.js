import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [filterSettings, setFilterSettings] = useState({});
  const [voiceInstruction, setVoiceInstruction] = useState('');

  useEffect(() => {
    fetchFilterSettings();
  }, []);

  const fetchFilterSettings = async () => {
    try {
      const response = await axios.get('/api/filter_settings');
      setFilterSettings(response.data);
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni del filtro:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/search?q=${searchQuery}`);
      setVideos(response.data);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
  };

  const updateFilterSettings = async () => {
    try {
      await axios.post('/api/filter_settings', filterSettings);
      alert('Impostazioni del filtro aggiornate');
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle impostazioni del filtro:', error);
    }
  };

  const handleVoiceInstruction = async () => {
    try {
      const response = await axios.post('/api/process_voice', { instruction: voiceInstruction });
      alert(response.data.message);
      fetchFilterSettings();  // Aggiorna le impostazioni dopo l'elaborazione vocale
    } catch (error) {
      console.error('Errore nell\'elaborazione dell\'istruzione vocale:', error);
    }
  };

  return (
    <div className="app">
      <header>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Cerca video..."
        />
        <button onClick={handleSearch}>Cerca</button>
      </header>

      <main>
        <div className="video-player">
          {currentVideo && (
            <YouTube videoId={currentVideo.id} />
          )}
        </div>

        <div className="video-list">
          {videos.map(video => (
            <div key={video.id} onClick={() => playVideo(video)}>
              <img src={video.thumbnail} alt={video.title} />
              <h3>{video.title}</h3>
              <p>{video.channel}</p>
            </div>
          ))}
        </div>

        <div className="filter-settings">
          <h2>Impostazioni Filtro</h2>
          <select 
            value={filterSettings.filter_type} 
            onChange={(e) => setFilterSettings({...filterSettings, filter_type: e.target.value})}
          >
            <option value="nlp">NLP</option>
          </select>
          {filterSettings.filter_type === 'nlp' && (
            <input 
              type="number" 
              value={filterSettings.threshold} 
              onChange={(e) => setFilterSettings({...filterSettings, threshold: parseFloat(e.target.value)})}
              step="0.1"
              min="0"
              max="1"
            />
          )}
          <button onClick={updateFilterSettings}>Aggiorna Filtro</button>
        </div>

        <div className="voice-interface">
          <h2>Interfaccia Vocale</h2>
          <input 
            type="text" 
            value={voiceInstruction} 
            onChange={(e) => setVoiceInstruction(e.target.value)} 
            placeholder="Inserisci istruzione vocale..."
          />
          <button onClick={handleVoiceInstruction}>Elabora Istruzione Vocale</button>
        </div>
      </main>
    </div>
  );
};

export default App;