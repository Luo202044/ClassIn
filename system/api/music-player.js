// music-player.js - 音乐播放器核心功能
// 独立文件，可在多个页面中使用

document.addEventListener('DOMContentLoaded', function() {
    // 播放器状态
    const playerState = {
        isPlaying: false,
        currentSongIndex: 0,
        playlist: [],
        isLoading: false
    };

    // GitHub音乐仓库配置 - 需要替换为你的实际信息
    const musicConfig = {
        // 请替换为你的GitHub用户名和仓库名
        // 格式: https://用户名.github.io/仓库名/
        baseUrl: "https://你的用户名.github.io/你的音乐仓库名/",
        apiFile: "api.txt",
        
        // 获取Api.txt文件的完整URL
        getApiUrl() {
            return `${this.baseUrl}${this.apiFile}`;
        },
        
        // 获取音乐文件的完整URL
        getMusicUrl(filename) {
            // 移除可能的前后空格和特殊字符
            const cleanFilename = filename.trim();
            return `${this.baseUrl}${cleanFilename}`;
        }
    };

    // DOM元素
    const musicPlayerContainer = document.getElementById('music-player-container');
    const playerHandle = document.getElementById('player-handle');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const totalTimeDisplay = document.getElementById('total-time-display');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const playerStatus = document.getElementById('player-status');

    // 创建音频对象
    const audio = new Audio();
    audio.volume = 0.7;

    // 初始化播放器
    function initPlayer() {
        // 设置初始状态
        updatePlayerUI();
        
        // 尝试从GitHub获取音乐列表
        fetchPlaylistFromGitHub()
            .then(playlist => {
                if (playlist.length > 0) {
                    playerStatus.textContent = '已加载音乐列表';
                } else {
                    playerStatus.textContent = '音乐列表为空';
                    // 如果没有音乐，可以加载模拟数据
                    loadMockPlaylist();
                }
            })
            .catch(error => {
                console.error('初始化播放器失败:', error);
                playerStatus.textContent = '加载失败，使用模拟数据';
                // 失败时使用模拟数据
                loadMockPlaylist();
            });
        
        // 设置事件监听器
        initEventListeners();
        
        // 控制台提示
        console.log("音乐播放器已初始化");
        console.log("提示: 点击右侧粉色箭头展开播放器");
        console.log("提示: 需要配置musicConfig.baseUrl为你的GitHub Pages音乐仓库地址");
    }

    // 从GitHub API获取播放列表
    async function fetchPlaylistFromGitHub() {
        playerStatus.textContent = '正在从GitHub加载音乐列表...';
        playerState.isLoading = true;
        
        try {
            const apiUrl = musicConfig.getApiUrl();
            console.log("正在请求音乐列表:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }
            
            const text = await response.text();
            console.log("API文件内容:", text);
            
            const filenames = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            console.log("解析到的音乐文件:", filenames);
            
            // 构建播放列表，直接使用文件名作为显示名
            playerState.playlist = filenames.map((filename, index) => {
                // 去掉扩展名，并将下划线/连字符替换为空格
                const displayName = filename
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[_-]/g, ' ');
                
                return {
                    title: displayName,
                    artist: '四季亭音乐库',
                    filename: filename,
                    src: musicConfig.getMusicUrl(filename),
                    index: index
                };
            });
            
            playerStatus.textContent = `已加载 ${playerState.playlist.length} 首歌曲`;
            console.log(`已加载 ${playerState.playlist.length} 首歌曲`);
            
            // 加载第一首歌曲
            if (playerState.playlist.length > 0) {
                loadSong(0);
            }
            
            return playerState.playlist;
        } catch (error) {
            console.error('从GitHub获取音乐列表失败:', error);
            throw error;
        } finally {
            playerState.isLoading = false;
        }
    }

    // 加载模拟播放列表（备用方案）
    function loadMockPlaylist() {
        console.log("加载模拟播放列表");
        
        // 模拟的播放列表
        playerState.playlist = [
            {
                title: "春之序曲",
                artist: "四季亭乐团",
                filename: "song1.mp3",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            },
            {
                title: "夏日微风",
                artist: "四季亭乐队",
                filename: "song2.mp3",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
            },
            {
                title: "秋日私语",
                artist: "四季亭音乐社",
                filename: "song3.mp3",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
            }
        ];
        
        // 加载第一首歌曲
        if (playerState.playlist.length > 0) {
            loadSong(0);
        }
    }

    // 加载歌曲
    function loadSong(index) {
        if (index < 0 || index >= playerState.playlist.length) return;
        
        const song = playerState.playlist[index];
        playerState.currentSongIndex = index;
        
        // 更新音频源
        audio.src = song.src;
        
        // 更新UI
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        
        // 重置进度条
        progress.style.width = "0%";
        currentTimeDisplay.textContent = "0:00";
        totalTimeDisplay.textContent = "0:00";
        
        // 更新播放器状态
        playerStatus.textContent = `第 ${index + 1} 首 / 共 ${playerState.playlist.length} 首`;
        
        console.log(`加载歌曲: ${song.title}, URL: ${song.src}`);
        
        // 如果之前是播放状态，自动播放新歌曲
        if (playerState.isPlaying) {
            playSong();
        }
    }

    // 播放/暂停歌曲
    function togglePlayPause() {
        if (playerState.playlist.length === 0) {
            playerStatus.textContent = '播放列表为空';
            return;
        }
        
        if (playerState.isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    // 播放歌曲
    function playSong() {
        audio.play()
            .then(() => {
                playerState.isPlaying = true;
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playBtn.title = "暂停";
                playerStatus.textContent = '播放中';
                console.log("开始播放");
            })
            .catch(error => {
                console.error("播放失败:", error);
                playerStatus.textContent = '播放失败';
            });
    }

    // 暂停歌曲
    function pauseSong() {
        audio.pause();
        playerState.isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = "播放";
        playerStatus.textContent = '已暂停';
        console.log("暂停播放");
    }

    // 上一首
    function prevSong() {
        if (playerState.playlist.length === 0) return;
        
        let newIndex = playerState.currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = playerState.playlist.length - 1; // 循环到最后一首
        }
        loadSong(newIndex);
        if (playerState.isPlaying) {
            playSong();
        }
    }

    // 下一首
    function nextSong() {
        if (playerState.playlist.length === 0) return;
        
        let newIndex = playerState.currentSongIndex + 1;
        if (newIndex >= playerState.playlist.length) {
            newIndex = 0; // 循环到第一首
        }
        loadSong(newIndex);
        if (playerState.isPlaying) {
            playSong();
        }
    }

    // 格式化时间 (秒 -> MM:SS)
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 展开/收起播放器
    function togglePlayer() {
        const isCollapsed = musicPlayerContainer.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 展开播放器
            musicPlayerContainer.classList.remove('collapsed');
            playerHandle.innerHTML = '<i class="fas fa-chevron-right"></i>';
            playerHandle.title = "收起播放器";
            playerStatus.textContent = '播放器已展开';
            console.log("展开播放器");
        } else {
            // 收起播放器
            musicPlayerContainer.classList.add('collapsed');
            playerHandle.innerHTML = '<i class="fas fa-chevron-left"></i>';
            playerHandle.title = "展开播放器";
            console.log("收起播放器");
        }
    }

    // 更新播放器UI状态
    function updatePlayerUI() {
        // 初始状态
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = "播放";
    }

    // 初始化事件监听器
    function initEventListeners() {
        // 播放/暂停按钮
        playBtn.addEventListener('click', togglePlayPause);
        
        // 上一首/下一首按钮
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        
        // 进度条点击事件
        progressBar.addEventListener('click', (e) => {
            if (!audio.duration) return;
            
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
        });
        
        // 音频时间更新事件
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progress.style.width = `${percent}%`;
                
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
            }
        });
        
        // 音频加载完成事件
        audio.addEventListener('loadedmetadata', () => {
            totalTimeDisplay.textContent = formatTime(audio.duration);
        });
        
        // 音频错误事件
        audio.addEventListener('error', (e) => {
            console.error("音频加载错误:", e);
            playerStatus.textContent = '音频加载失败';
        });
        
        // 音频结束事件 - 自动播放下一首
        audio.addEventListener('ended', () => {
            console.log("歌曲播放结束");
            if (playerState.playlist.length > 1) {
                nextSong();
            } else {
                pauseSong();
            }
        });
        
        // 播放器展开/收起
        playerHandle.addEventListener('click', togglePlayer);
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 空格键切换播放/暂停
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                togglePlayPause();
            }
            
            // 左箭头上一首，右箭头下一首（Ctrl+方向键）
            if (e.code === 'ArrowLeft' && e.ctrlKey) {
                prevSong();
            }
            if (e.code === 'ArrowRight' && e.ctrlKey) {
                nextSong();
            }
        });
        
        // 点击页面其他区域收起播放器（可选功能）
        document.addEventListener('click', (e) => {
            // 如果播放器是展开状态，并且点击的不是播放器本身
            if (!musicPlayerContainer.classList.contains('collapsed') &&
                !musicPlayerContainer.contains(e.target) &&
                e.target !== playerHandle &&
                !playerHandle.contains(e.target)) {
                
                // 收起播放器
                musicPlayerContainer.classList.add('collapsed');
                playerHandle.innerHTML = '<i class="fas fa-chevron-left"></i>';
                playerHandle.title = "展开播放器";
                console.log("点击外部区域，收起播放器");
            }
        });
    }

    // 初始化播放器
    initPlayer();
    
    // 全局导出（可选，方便调试）
    window.musicPlayer = {
        play: playSong,
        pause: pauseSong,
        togglePlayPause: togglePlayPause,
        prevSong: prevSong,
        nextSong: nextSong,
        loadSong: loadSong,
        togglePlayer: togglePlayer,
        getState: () => ({ ...playerState }),
        getCurrentSong: () => playerState.playlist[playerState.currentSongIndex] || null,
        getPlaylist: () => [...playerState.playlist],
        fetchPlaylistFromGitHub: fetchPlaylistFromGitHub,
        musicConfig: musicConfig
    };
});