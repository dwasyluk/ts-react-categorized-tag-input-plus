import * as React from 'react';

import TagComponent, {Tag} from './TagComponent';

export interface Category {
  id: string;
  type: string;
  title: string;
  items: any[];
  single?: boolean;
}

interface CategoryComponentProps {
  category: string | number;
  selected: boolean;
  selectedItem: number;
  input: string | any; //or any to allow for === checking
  addNew: boolean;
  onAdd: Function;
  getTagStyle?: Function;
  getCreateNewText?: Function;

  type: string;
  title: string;
  items: any[];
  single?: boolean;
}

export default class CategoryComponent extends React.Component<CategoryComponentProps, {}> {
  private getCreateNewText = (title: string, text: string) => `Create new ${title} "${text}"`;

  onAdd = (title: string) => {
    return () => {
      this.props.onAdd({
        category: this.props.category,
        title: title
      });
    };
  };

  onCreateNew = (e: any) => {
    e.preventDefault();
    this.onAdd(this.props.input)();
  };

  getTagStyle = (item: Tag) => {
    return this.props.getTagStyle ? this.props.getTagStyle(item) : {}
  };

  itemToTag = (item: any, i: any) => {
    return (
      <TagComponent selected={this.isSelected(i)}
        input={this.props.input} text={item} addable={true} deletable={false}
        onAdd={this.onAdd(item)} key={item + '_' + i} style={this.getTagStyle(item)} />
    );
  };

  fullMatchInItems = () => {
    for (let i = 0, len = this.props.items.length; i < len; i++) {
      if (this.props.items[i] === this.props.input) {
        return true;
      }
    }
    return false;
  };

  getItems = () => {
    return {
      items: this.props.items.map(this.itemToTag),
      fullMatch: this.fullMatchInItems(),
    };
  };

  isSelected = (i: any) => {
    return this.props.selected &&
      (i === this.props.selectedItem || this.props.single);
  };

  getAddBtn = (fullMatch: boolean, selected: boolean) => {
    const title = this.props.type || this.props.title;
    const text = this.props.input;
    const getText = this.props.getCreateNewText || this.getCreateNewText;
    if (this.props.addNew && !fullMatch && !this.props.single) {
      return [
        this.props.items.length > 0 ?
          <span key='cat_or' className='cti__category__or'>or</span> :
          null,
        <button
          key='add_btn'
          className={'cti__category__add-item' + (selected ? ' cti-selected' : '')}
          onClick={this.onCreateNew}
          >{getText(title, text)}</button>
      ];
    }

    return null;
  };

  render() {
    let { items, fullMatch } = this.getItems();
    let addBtn = this.getAddBtn(
      fullMatch,
      (items.length === 0 || this.props.selectedItem >= items.length) &&
      this.props.selected
    );

    return (
      <div className='cti__category'>
        <h5 className='cti__category__title'>{this.props.title}</h5>
        <div className='cti__category__tags'>
          {items}
          {addBtn}
        </div>
      </div>
    );
  }
}
