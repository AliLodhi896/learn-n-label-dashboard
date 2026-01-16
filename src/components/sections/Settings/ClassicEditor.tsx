import { ReactElement, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface ClassicEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content...', minHeight = 400 }: ClassicEditorProps): ReactElement => {
  const [editorData, setEditorData] = useState(value);

  useEffect(() => {
    setEditorData(value);
  }, [value]);

  return (
    <Box
      sx={{
        width: '100%',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
        minHeight: minHeight,
        '& .ck-editor': {
          minHeight: minHeight,
          width: '100%',
        },
        '& .ck-editor__main': {
          width: '100%',
        },
        '& .ck-editor__editable': {
          minHeight: minHeight,
          width: '100%',
        },
        '& .ck-toolbar': {
          width: '100%',
        },
        '&:focus-within': {
          borderColor: 'primary.main',
        },
      }}
    >
      <CKEditor
        editor={ClassicEditor as any}
        data={editorData}
        config={{
          placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            '|',
            'undo',
            'redo',
          ],
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          setEditorData(data);
          onChange(data);
        }}
      />
    </Box>
  );
};

export default RichTextEditor;
