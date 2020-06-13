'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';

class RichTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: EditorState.createEmpty() };
        
        this.onChange = editorState => this.setState({editorState});

        this.focus = () => this.refs.editor.focus();

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          this.onChange(newState);
          return true;
        }
        return false;
      }

      _onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
      }

      _toggleBlockType(blockType) {
        this.onChange(
          RichUtils.toggleBlockType(
            this.state.editorState,
            blockType
          )
        );
      }

      _toggleInlineStyle(inlineStyle) {
        this.onChange(
          RichUtils.toggleInlineStyle(
            this.state.editorState,
            inlineStyle
          )
        );
      }

    render() {


        let className = 'editor';
        const contentState = this.state.editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += 'editor-hide-placeholder';
            }
        }

        return (
        <div className="container">

                <BlockStyleControls
                editorState={this.state.editorState}
                onToggle={this.toggleBlockType}
                />

                <InlineStyleControls
                editorState={this.state.editorState}
                onToggle={this.toggleInlineStyle}
                />

                <div className="editor" onClick={this.focus}>
                    <Editor
                    blockStyleFn={getBlockStyle}
                    customStyleMap={styleMap}
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    onTab={this.onTab}
                    placeholder="Tell a story..."
                    ref="editor"
                    spellCheck={true}
                    />
                </div>

        </div>
        )
    }

}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
]

const BlockStyleControls = (props) => {

    const { editorState } = props;
    
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

        return (
            <div className="controls">
                {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
            </div>
        )
    
}

const INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
  ];

const InlineStyleControls = (props) => {

    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
      <div className="controls">
        {INLINE_STYLES.map(type =>
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };

class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (event) => {
            event.preventDefault();
            this.props.onToggle(this.props.style);
        }
    }

    render() {
        let className = 'style-button';
        if (this.props.active) {
            className += 'style-button-active';
        }

        return (
            <span className={className}
            onMouseDown={this.onToggle}
            >
                {this.props.label}
            </span>
        )

    }

}

const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'blockquote';
      default: return null;
    }
  }

ReactDOM.render(<RichTextEditor />, document.getElementById('app'));