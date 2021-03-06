import * as React from 'react';

import Input from './Input';
import Panel from './Panel';
import * as key from './keyboard';
import {Category} from "./Category";
import {Tag} from "./Tag";
import FormEvent = React.FormEvent;
import Timer = NodeJS.Timer;

import "./CategorizedTagInput.css";

export function isCategoryItemValid(i: any) {
  return typeof i === 'string' && i.trim().length > 0;
}

export function isCategoryValid(c: any) {
  return typeof c === 'object'
    && c.id
    && c.title
    && c.items
    && Array.isArray(c.items)
    && c.items.every(isCategoryItemValid)
    && (c.type || c.single);
}

interface CategorizedTagInputProps {
  addNew?: boolean;
  categories: Category[];
  transformTag?: (tag: Tag) => string;
  value?: Tag[];
  onBlur?: (event: FormEvent<HTMLInputElement>) => void;
  onFocus?: (event: FormEvent<HTMLInputElement>) => void;
  onTagsChange?: (newTags: Tag[]) => void;
  onTextChange?: (test: string) => void;
  placeholder?: string;
  getTagStyle?: () => any,
  getCreateNewText?: (title: string, text: string) => string;
}

interface CategorizedTagInputState {
  value?: string;
  selection?: CategorizedTagInputSelection;
  panelOpened?: boolean;
  categories?: Category[];
  addNew?: boolean;
}

interface CategorizedTagInputSelection {
  item: number;
  category: number;
}

export default class CategorizedTagInput extends React.Component<CategorizedTagInputProps, CategorizedTagInputState> {
  static defaultProps: any;

  private timeout: any;

  public state: CategorizedTagInputState = {
      value: '',
      selection: {
        item: 0,
        category: 0
      },
      panelOpened: false,
      categories: [] as Category[],
      addNew: this.props.addNew === undefined ? true : this.props.addNew
    };

  componentWillMount = () => {
    if (!this.props.categories.every(isCategoryValid)) {
      throw new Error('invalid categories source provided for react-categorized-tag-input');
    }
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  filterCategories = (input: string) => {
    let categories = this.props.categories; /*.map(c => {
      c = Object.assign({}, c, {
        items: c.items.filter(this.filterItems(input))
      });
      return (c.items.length === 0 && (!this.state.addNew || c.single)) ? null : c;
    }).filter(c => c !== null);      */

    let selection = this.state.selection;
    /*if (this.state.selection.category >= categories.length) {
      selection = {
        category: 0,
        item: 0
      };
    } else {
      if (selection.item >= categories[selection.category].items.length) {
        selection.item = 0;
      }
    } */

    this.setState({
      categories,
      selection
    });
  };

  filterItems = (input: string) => {
    return function (i: string): boolean {
      console.log("input:", input, "I:", i);
      if (input.length === 1) {
        return i.toLowerCase().trim() === input;
      }
      return i.toLowerCase().indexOf(input.trim().toLowerCase()) >= 0;
    };
  };

  openPanel = () => {
    this.setState({ panelOpened: true });
  };

  handleOnFocus = (e: any) => {
    this.openPanel();
    this.filterCategories("");

    if(this.props.onFocus)
      this.props.onFocus(e);
  };

  closePanel = () => {
    // Prevent the panel from hiding before the click action takes place
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.setState({ panelOpened: false });
    }, 150);
  };

  onValueChange = (e: any) => {
    let value = e.target.value;
    this.setState({ value, panelOpened: value.trim().length > 0 || !isNaN(Number(value.trim())) });
    this.filterCategories(value);
    this.props.onTextChange(e.target.value);
  };

  onTagDeleted = (i: number) => {
    const newTags = this.props.value.slice();
    newTags.splice(i, 1);
    this.props.onTagsChange(newTags)
  };

  onAdd = (newTag: Tag) => {
    const newTags: Tag[] = this.props.value.concat([newTag]);
    this.setState({
      value: '',
      panelOpened: true
    });

    (this.refs as any).input.focusInput();
    this.props.onTagsChange(newTags);
  };

  addSelectedTag = () => {
    if (!(this.state.panelOpened && this.state.value.length > 0)) {
      return;
    }

    const category = this.state.categories[this.state.selection.category];
    const title = category.items[this.state.selection.item].toString();
    this.onAdd({
      category: category.id.toString(),
      title: title || this.state.value
    });
  };

  handleBackspace = (e: any) => {
    if (this.state.value.trim().length === 0) {
      e.preventDefault();
      this.onTagDeleted(this.props.value.length - 1);
    }
  };

  handleArrowLeft = () => {
    let result = this.state.selection.item - 1;
    this.setState({selection: {
      category: this.state.selection.category,
      item: result >= 0 ? result : 0
    }});
  };

  handleArrowUp = () => {
    let result = this.state.selection.category - 1;
    this.setState({selection: {
      category: result >= 0 ? result : 0,
      item: 0
    }});
  };

  handleArrowRight = () => {
    let result = this.state.selection.item + 1;
    let cat = this.state.categories[this.state.selection.category];
    this.setState({selection: {
      category: this.state.selection.category,
      item: result <= cat.items.length ? result : cat.items.length
    }});
  };

  handleArrowDown = () => {
    let result = this.state.selection.category + 1;
    let cats = this.state.categories;
    this.setState({selection: {
      category: result < cats.length ? result : cats.length - 1,
      item: 0
    }});
  };

  onKeyDown = (e: any) =>  {
    let result;
    switch (e.keyCode) {
    case key.TAB:
    case key.ENTER:
      if (!this.state.value){
        // enable normal tab/enter behavior
        // (don't preventDefault)
        break;
      }
    case key.COMMA:
      e.preventDefault();
      this.addSelectedTag();
      break;
    case key.BACKSPACE:
      this.handleBackspace(e);
      break;
    case key.LEFT:
      this.handleArrowLeft();
      break;
    case key.UP:
      this.handleArrowUp();
      break;
    case key.RIGHT:
      this.handleArrowRight();
      break;
    case key.DOWN:
      this.handleArrowDown();
      break;
    }
  };

  render() {
    return (
      <div className='cti__root'>
        <Input openPanel={this.openPanel} closePanel={this.closePanel}
          onValueChange={this.onValueChange} onTagDeleted={this.onTagDeleted}
          onKeyDown={this.onKeyDown} placeholder={this.props.placeholder} value={this.state.value}
          getTagStyle={this.props.getTagStyle}
          tags={this.props.value}
          transformTag={this.props.transformTag}
          onBlur={this.props.onBlur}
          onFocus={this.handleOnFocus}
          ref='input' />
        {this.state.panelOpened /*&& this.state.value.length > 0*/ ? <Panel categories={this.state.categories}
          selection={this.state.selection} onAdd={this.onAdd}
          input={this.state.value}
          getCreateNewText={this.props.getCreateNewText}
          addNew={this.props.addNew === undefined ? true : this.props.addNew} /> : ''}
      </div>
    );
  };
};

CategorizedTagInput.defaultProps = {
  onChange(newTags: any[]){
    // do nothing
  },
  value: []
};
