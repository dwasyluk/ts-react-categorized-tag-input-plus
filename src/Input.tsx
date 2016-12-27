import * as React from 'react';
import TagComponent, {Tag} from "./TagComponent";
import FormEvent = React.FormEvent;
import * as SearchIcon from "../../../images/icons/16x16/interface search.svg";


interface InputProps {
  openPanel: (event: FormEvent<HTMLInputElement>) => void;
  closePanel: Function;
  onValueChange: (event: FormEvent<HTMLInputElement>) => void;
  onTagDeleted: Function;
  onKeyDown: (event: FormEvent<HTMLInputElement>) => void;
  value: string;
  tags: Tag[];
  placeholder?: string;
  onBlur?: Function;
  onFocus?: Function;
  getTagStyle?: Function;
  transformTag?: Function;
}

export default class Input extends React.Component<InputProps, {}> {

  static defaultProps: any;

  focusInput = () => {
   (this.refs as any).input.focus();
  };

  getTags = () => {
    console.log("Input tags: ", this.props.tags);
    return this.props.tags.map((tag, i) => {
      return (
        <TagComponent selected={false} input='' text={this.props.transformTag(tag)} addable={false}
          deletable={true} key={tag.title + '_' + i}
          onDelete={() => this.props.onTagDeleted(i)}
          style={this.props.getTagStyle(tag)}/>
      );
    });
  };

  onBlur = (e: any) =>  {
    this.props.closePanel();
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(e);
    }
  };

  onFocus = (e: any) => {
    this.props.openPanel(e);
    if (typeof this.props.onFocus === 'function') {
      this.props.onFocus(e);
    }
  };

  render() {
    const placeholder = this.props.placeholder || '';
    let size = this.props.value.length === 0 ?
      placeholder.length :
      this.props.value.length;
    return (
      <div className='cti__input' onClick={this.focusInput}>
        <SearchIcon />
        {this.getTags()}
        <input type='text' ref='input' value={this.props.value}
          size={size + 2}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.props.onValueChange} onKeyDown={this.props.onKeyDown}
          placeholder={placeholder} aria-label={placeholder}
          className='cti__input__input' />
      </div>
    );
  }
};

Input.defaultProps = {
    getTagStyle(tag: Tag) {
      // empty style object by default
      return {};
    },
    transformTag(tag: Tag){
      return tag.title;
    }
};
