import * as React from 'react';
import CategoryComponent from './CategoryComponent';
import Props = React.Props;

interface PanelProps extends React.HTMLAttributes<any> {
  categories: any[];
  selection: any;
  onAdd: Function;
  input: string;
  addNew: boolean;
  getTagStyle?: Function
  getCreateNewText: Function;
}


export default class Panel extends React.Component<PanelProps, {}> {

  getCategories() {
    return this.props.categories.map((c, i) => {
      return (
        <CategoryComponent key={c.id} items={c.items} category={c.id} title={c.title}
          selected={this.props.selection.category === i}
          selectedItem={this.props.selection.item}
          input={this.props.input} addNew={this.props.addNew}
          type={c.type} onAdd={this.props.onAdd} single={c.single}
          getTagStyle={this.props.getTagStyle}
          getCreateNewText={this.props.getCreateNewText} />
      );
    });
  }

  render() {
    return (
      <div className='cti__panel'>
        {this.getCategories()}
      </div>
    );
  }
}

