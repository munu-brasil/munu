import React from 'react';
import Chip from '@mui/material/Chip';
import Editor from './Editor';
import { Theme } from '@mui/material';

export interface TagsProps {
  style?: any;
  chipStyle?: any;
  value: Array<Tag>;
  onDelete: (tag: Tag) => void;
  onChange: (tag: Tag) => void;
}
export interface Tag {
  key: string;
  value: any;
  label: string;
  type: TagType;
  options?: { value: any; label: string }[];
}
export enum TagType {
  String = 'string',
  Date = 'date',
  DateRange = 'daterange',
  Boolean = 'boolean',
  Number = 'number',
  NumberRange = 'numberrange',
  Select = 'select',
  NumberList = 'numberlist',
  StringList = 'stringList',
}
export type TagValueType = {
  [TagType.String]?: string;
  [TagType.Date]?: string;
  [TagType.DateRange]?: { to?: string; from?: string };
  [TagType.Boolean]?: boolean;
  [TagType.Number]?: number;
  [TagType.NumberRange]?: { to?: number; from?: number };
  [TagType.Select]?: string;
  [TagType.NumberList]?: number[];
  [TagType.StringList]?: string[];
};

export interface TagsState {
  tags: Array<Tag>;
  editing: Tag | null;
}

const styles = (theme: Theme) => ({
  formControl: {
    minWidth: 120,
  },
});

export class Tags extends React.PureComponent<TagsProps, TagsState> {
  state = { editing: null as any, tags: Array<Tag>() };

  static getDerivedStateFromProps(props: any, state: any) {
    if (state.tags !== props.value) {
      state = {
        ...state,
        tags: props.value,
      };
      if (!props.value.length) {
        state.editing = null;
      }
      props.value.forEach((t: any) => {
        if (!t.value) {
          state.editing = t;
        }
      });
    }
    return state;
  }

  handlePopClose = (t: any) => {
    this.setState({ editing: null });
    if (!t?.value) {
      this.props.onDelete(t);
    }
  };

  handlePopApply = (tag: Tag, value: any) => {
    this.setState({ editing: null });
    this.props.onChange({ ...tag, value });
  };

  tagLabel(t: Tag) {
    if (!t.value) {
      return '';
    }
    switch (t.type) {
      case TagType.NumberRange:
      case TagType.DateRange:
        return `${t.value.from} ~ ${t.value.to}`;
      case TagType.Boolean:
        return `${t.value === 'true' ? 'verdadeiro' : 'falso'}`;
      case TagType.Select:
        const option = t?.options?.filter?.((o) => o.value === t.value)?.[0];
        return option?.label ?? '';
      case TagType.StringList:
      case TagType.NumberList:
        return (t?.options ?? [])
          .filter((o) => (t?.value ?? []).indexOf(o.value) !== -1)
          .map((o) => o?.label)
          .join(', ');
      default:
        return t.value;
    }
  }

  render() {
    const { style, chipStyle, onDelete } = this.props;

    const { tags, editing } = this.state;
    const orderedTags = tags
      .map((o) => ({ ...o, chipLabel: `${o.label}: "${this.tagLabel(o)}"` }))
      .sort((a, b) => {
        const al = a.chipLabel.length;
        const bl = b.chipLabel.length;
        if (al > bl) {
          return -1;
        }
        if (al < bl) {
          return 1;
        }
        return 0;
      });
    return (
      <div style={style}>
        {orderedTags.map((o, i) => (
          <div key={o.key + i}>
            <Chip
              style={{ marginRight: 6, position: 'relative', ...chipStyle }}
              label={o.chipLabel}
              onClick={(e) => this.setState({ editing: o })}
              onDelete={(e) => {
                e.stopPropagation();
                onDelete(o);
              }}
            />
            {(editing || { key: '' }).key === o.key && (
              <Editor
                style={{ position: 'absolute', top: 0, zIndex: 99999 }}
                tag={editing}
                onCancel={() => this.handlePopClose(o)}
                onApply={this.handlePopApply.bind(this, o)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default Tags;
