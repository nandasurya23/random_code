/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRandom, FaRedoAlt, FaTrash, FaHeart, FaSpinner } from 'react-icons/fa';
import clsx from 'clsx';

const MediaPlayer = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [trackCurrentTime, setTrackCurrentTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (audio) {
      const updateProgress = () => {
        if (audio) {
          setTrackCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleNextTrack);
      
      audio.addEventListener('loadedmetadata', () => {
        setTrackDuration(audio.duration);
      });

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleNextTrack);
      };
    }
  }, [audio]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setPlaylist((prevPlaylist) => [...prevPlaylist, ...files]);
    }
  };

  const playTrack = (file: File, index: number) => {
    if (audio) {
      audio.pause();
    }

    setLoading(true);
    const newAudio = new Audio(URL.createObjectURL(file));
    setAudio(newAudio);
    setCurrentTrack(file.name);
    setCurrentTrackIndex(index);  // Update current track index
    setIsPlaying(true);
    newAudio.play();
    newAudio.playbackRate = playSpeed;
    setLoading(false);
  };

  const handlePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (playlist.length > 1) {
      let nextIndex = currentTrackIndex + 1;
      if (nextIndex >= playlist.length) nextIndex = 0;
      if (isShuffle) nextIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(nextIndex);
      playTrack(playlist[nextIndex], nextIndex);
    }
  };

  const handlePreviousTrack = () => {
    if (playlist.length > 1) {
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) prevIndex = playlist.length - 1;
      setCurrentTrackIndex(prevIndex);
      playTrack(playlist[prevIndex], prevIndex);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value) / 100;
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const handleProgressBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audio) {
      const newProgress = parseFloat(event.target.value);
      audio.currentTime = (newProgress / 100) * audio.duration;
      setProgress(newProgress);
    }
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleRepeatToggle = () => {
    setIsRepeat(!isRepeat);
    if (audio) {
      audio.loop = !isRepeat;
    }
  };

  const handleRemoveTrack = (index: number) => {
    const updatedPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(updatedPlaylist);
    if (currentTrackIndex === index) {
      handleNextTrack();
    }
  };

  const handleFavoriteToggle = (fileName: string) => {
    const updatedFavorites = new Set(favorites);
    if (updatedFavorites.has(fileName)) {
      updatedFavorites.delete(fileName);
    } else {
      updatedFavorites.add(fileName);
    }
    setFavorites(updatedFavorites);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePlaySpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setPlaySpeed(newSpeed);
    if (audio) {
      audio.playbackRate = newSpeed;
    }
  };

  const filteredPlaylist = playlist.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-8 rounded-3xl shadow-2xl">
      <h2 className="text-5xl mb-8 text-center font-extrabold text-pink-400">Media Player</h2>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-96 px-6 py-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-lg"
        />
      </div>

      {/* File Upload */}
      <div className="mb-6 flex justify-center">
        <label className="flex items-center justify-center cursor-pointer p-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-xl">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <span className="text-xl font-semibold">Choose Files</span>
        </label>
      </div>

      {/* Playlist */}
      <div className="bg-gray-800 p-6 rounded-3xl mb-8 shadow-xl">
        <h3 className="text-2xl mb-4 font-bold">Playlist</h3>
        <ul className="space-y-4">
          {filteredPlaylist.length > 0 ? (
            filteredPlaylist.map((file, index) => (
              <li key={index} className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-700 transition-all cursor-pointer" onClick={() => playTrack(file, index)}>
                <span className="truncate text-lg">{file.name}</span>
                <div className="flex items-center space-x-4">
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveTrack(index); }} className="text-red-500 hover:text-red-700 transition-all">
                    <FaTrash />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(file.name); }} className={clsx("text-yellow-500", { "text-yellow-400": favorites.has(file.name) }, "hover:text-yellow-400 transition-all")}>
                    <FaHeart />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-xl text-center">No tracks available. Upload some files!</p>
          )}
        </ul>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="bg-gray-800 p-6 rounded-3xl mb-8 shadow-xl">
          <h3 className="text-2xl mb-4 font-bold">Now Playing</h3>
          <p className="text-lg">{currentTrack}</p>

          {/* Controls */}
          <div className="mt-6 flex justify-center items-center space-x-6">
            <button onClick={handlePreviousTrack} className="text-5xl hover:text-pink-500 transition-all">
              &#9664;
            </button>
            <button onClick={handlePlayPause} className="text-5xl hover:text-pink-500 transition-all">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={handleNextTrack} className="text-5xl hover:text-pink-500 transition-all">
              &#9654;
            </button>
          </div>

          {/* Volume Control */}
          <div className="mt-4 flex justify-center items-center space-x-4">
            <FaVolumeMute className={clsx("text-xl", { "hidden": volume > 0 })} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-32"
            />
            <FaVolumeUp className={clsx("text-xl", { "hidden": volume === 0 })} />
            <span className="ml-2">{Math.round(volume * 100)}%</span> {/* Volume percentage */}
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="mt-4 flex justify-center">
              <FaSpinner className="animate-spin text-pink-500 text-3xl" />
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <input
              type="range"
              value={progress}
              onChange={handleProgressBarChange}
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-sm mt-2">
              <span>{formatTime(trackCurrentTime)}</span>
              <span>{formatTime(trackDuration - trackCurrentTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Play Speed */}
      <div className="flex justify-center items-center space-x-4">
        <span>Play Speed:</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={playSpeed}
          onChange={handlePlaySpeedChange}
          className="w-40"
        />
        <span>{playSpeed}x</span>
      </div>

      {/* Shuffle and Repeat */}
      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={handleShuffleToggle} className="text-xl text-pink-500">
          <FaRandom className={clsx({ 'text-gray-500': !isShuffle })} />
        </button>
        <button onClick={handleRepeatToggle} className="text-xl text-pink-500">
          <FaRedoAlt className={clsx({ 'text-gray-500': !isRepeat })} />
        </button>
      </div>
    </div>
  );
};

export default MediaPlayer;
