import {useCallback, useEffect, useState} from "react";
import sunImg from '../Backgrounds/sun.png';
import rainImg from '../Backgrounds/rain.png';
import cloudImg from '../Backgrounds/cloud.png';
import snowImg from '../Backgrounds/snow.png';


const API_KEY = 'eaded1a8efc91e9198064502d28dbb5b';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function WeatherApp() {
    const [city, setCity] = useState('');
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bgImage, setBgImage] = useState(`url(${sunImg})`);
    const [textColor, setTextColor] = useState('#000');
    const [box, setBox] = useState('#ffffff');
    const fetchWeather = useCallback ( async (cityName = 'Hanoi') => {
        setLoading(true);
        try {
            const [currentRes, forecastRes] = await Promise.all([
                fetch(`${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=vi`),
                fetch(`${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=vi`)
            ]);

            const currentData = await currentRes.json();
            const forecastResult = await forecastRes.json();

            if (currentData.cod === 200) {
                setCurrentWeather(currentData);
                updateBackground(currentData.weather[0].description.toLowerCase());
            } else {
                setCurrentWeather(null);
                alert(`Không tìm thấy thành phố: ${cityName}`);
            }

            if (forecastResult.cod === "200") {
                const now =  Date.now() / 1000;
                const forecastDataFilter = forecastResult.list.filter(item => item.dt >= now);
                setForecastData(forecastDataFilter.length > 6 ? forecastDataFilter.slice(0,6) : forecastDataFilter);
            } else {
                setForecastData(null);
                alert(`Không tìm thấy data forecast: ${cityName}`);
            }
        } catch (error) {
            alert('Lỗi khi tải dữ liệu!');
        }
        setLoading(false);
    },[]);

    const updateBackground = (condition) => {
        if (condition.includes('mưa')) {
            setBgImage(`url(${rainImg})`);
            setTextColor('#ffffff');
            setBox('#070707');
        } else if (condition.includes('mây đen')) {
            setBgImage(`url(${cloudImg})`);
            setTextColor('#ffffff');
            setBox('#0b0b0b');
        } else if (condition.includes('nắng') || condition.includes('trời quang') || condition.includes('mây')) {
            setBgImage(`url(${sunImg})`);
            setTextColor('#000000');
            setBox('#ffffff');
        } else if (condition.includes('tuyết')) {
            setBgImage(`url(${snowImg})`);
            setTextColor('#000000');
            setBox('#ffffff');
        }
    };

    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    const handleSearch = () => {
        fetchWeather(city.trim() || 'Hanoi');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };


    const convertTime = (time) => {

        return new Date(time * 1000).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false  // 24-hour format
        });
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            fontFamily: 'sans-serif',
            minHeight: '100vh',

        }}>
            <div style={{
                width: 'auto',
                height: 'auto',
                overflowY: 'auto',
                textAlign: 'center',
                padding: '20px',
                backgroundImage: bgImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(0,0,0,0.3)',
                marginBottom: '10px',
                marginTop: '10px',
                color: textColor
            }}>
                <header><h1>Weather App</h1></header>
                <div className="search">
                    <input
                        type="text"
                        placeholder="Nhập tên thành phố..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyPress}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '5px 10px',
                            backgroundColor: '#f8f7f7',
                            color: '#000',
                            fontSize: '1em'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            marginLeft: '8px',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '5px 10px',
                            backgroundColor: '#000',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1em'
                    }}>
                        Tìm
                    </button>
                </div>

                {loading && <p>Đang tải dữ liệu...</p>}

                {currentWeather && !loading && (
                    <div className="info"
                    style={{
                        fontSize:'1.2em'
                    }}>
                        <h2>{currentWeather.name}, {currentWeather.sys.country}</h2>
                        <h3>{currentWeather.main.temp}°C</h3>
                        <p>{currentWeather.weather[0].description}</p>
                        <img
                            src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                            alt="weather-icon"
                        />
                        <p>Độ ẩm: {currentWeather.main.humidity}%</p>
                        <p>Gió: {currentWeather.wind.speed} km/h</p>
                        <p>Thời gian: {new Date(currentWeather.dt * 1000).toLocaleString()}</p>
                    </div>
                )}

                {forecastData && !loading && (
                    <div>
                        <h3>Dự báo giờ tới:</h3>
                        <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', textAlign: 'center', }}>
                            {forecastData.map((item, index) => (
                                <div key={index} style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor: box,
                                    textAlign: 'center',
                                    minWidth: '100px'
                                }}>
                                    <p>{convertTime(item.dt)}</p>
                                    <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="icon" />
                                    <p>{item.main.temp}°C</p>
                                    <p style={{ fontSize: '0.8em' }}>{item.weather[0].description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WeatherApp;
