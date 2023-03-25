export const ParagraphTitle: React.FC = () => {
    return (
      <div style={{ display: 'flex', userSelect: 'none' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'gray' }} />
        <div style={{ marginLeft: 8, flex: 1 }}>
          <div style={{ color: '#646a73', fontSize: 14, lineHeight: '22px' }}>Nickname</div>
        </div>
      </div>
    );
  };
  
  