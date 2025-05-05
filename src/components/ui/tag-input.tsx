
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  setTags, 
  placeholder = 'Add tags...', 
  maxTags = 10 
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    }
  };
  
  const addTag = (tag: string) => {
    const normalizedTag = tag.trim();
    
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      setTags([...tags, normalizedTag]);
      setInputValue('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTag(tag)}
              className="ml-1 h-4 w-4 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags` : placeholder}
          disabled={tags.length >= maxTags}
          className="flex-grow"
        />
        
        <Button
          type="button"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim() || tags.length >= maxTags}
          className="ml-2"
        >
          Add
        </Button>
      </div>
      
      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum number of tags reached
        </p>
      )}
    </div>
  );
};

export default TagInput;
