import styles from './ContrastText.module.css';

interface ContrastTextProps {
  children: React.ReactNode;
  className?: string;
}

const ContrastText: React.FC<ContrastTextProps> = ({ children, className }) => {
  return (
    <div className={`${styles.contrast} ${className ?? ''}`}>
      {children}
    </div>
  );
};

export default ContrastText;
