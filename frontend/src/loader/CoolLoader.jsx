import './CoolLoader.css';

const CoolLoader = ({ loading = true, text = "Загрузка" }) => {
    if (!loading) return null;

    return (
        <div className="overlay">
            <div className="spinner"></div>
            <div className="label">{text}</div>
        </div>
    );
};

export default CoolLoader;