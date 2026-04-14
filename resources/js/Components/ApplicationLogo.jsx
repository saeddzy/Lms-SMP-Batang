export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/images/home-kuning-png.png"
            alt=""
            className={className}
            {...props}
        />
    );
}
