import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TreeNodeComponent } from './tree-node/tree-node.component';
import { FormsModule } from '@angular/forms';

export interface TreeNode {
  idParent?: string | null;
  children: TreeNode[];
  parent?: TreeNode | null;
  expanded: boolean;
  selected: boolean;
  indeterminate?: boolean;
  visible: boolean;
  tag: any;
}


@Component({
  selector: 'app-tree-view-checklist',
  imports: [CommonModule, TreeNodeComponent, FormsModule],  // 👈 import component con vào đây
  templateUrl: './tree-view-checklist.component.html',
  styleUrls: ['./tree-view-checklist.component.css']
})
export class TreeViewChecklistComponent implements OnInit {
  @Input() treeData: Array<
    {
      id: string,
      idParent?: string;
      children?: any[]
    }> = [];

  allNodes: { [id: string]: TreeNode } = {};
  treeStructure: { [id: string]: TreeNode } = {};
  searchText: string = '';

  ngOnInit() {
    this.buildTree(this.treeData);
  }

  buildTree(treeData: Array<{ id: string; idParent?: string; children?: any[] }>) {
    this.allNodes = {};
    this.treeStructure = {};

    treeData.forEach(item => {
      this.allNodes[item.id] = {
        tag: item,
        children: [],
        expanded: false,
        selected: false,
        visible: true
      };
    });

    treeData.forEach(item => {
      if (!item.idParent) {
        this.treeStructure[item.id] = this.allNodes[item.id];
      } else if (this.allNodes[item.idParent]) {
        this.allNodes[item.idParent].children.push(this.allNodes[item.id]);
        this.allNodes[item.id].parent = this.allNodes[item.idParent];
      }
    });
  }

  ///trả về những mục user đã check chọn
  getSelected(): any[] {
    const selectedNodes: any[] = [];
    Object.values(this.allNodes).forEach(node => {
      if (node.selected) {
        selectedNodes.push(node);
      }
    });
    return selectedNodes;
  }

  toggleExpand(node: any) {
    node.expanded = !node.expanded;
  }

  toggleSelect(node: any) {
    node.selected = !node.selected;
    this.updateChildren(node, node.selected);
  }

  updateChildren(node: any, selected: boolean) {
    // node.children.forEach(child => {
    //   child.selected = selected;
    //   this.updateChildren(child, selected);
    // });
  }

  selectAll() {
    Object.values(this.allNodes).forEach(n => n.selected = true);
  }

  unselectAll() {
    Object.values(this.allNodes).forEach(n => n.selected = false);
  }

  expandAll() {
    Object.values(this.allNodes).forEach(n => n.expanded = true);
  }

  collapseAll() {
    Object.values(this.allNodes).forEach(n => n.expanded = false);
  }

  searchNodes(query: string) {
    if (!query.trim()) {
      Object.values(this.allNodes).forEach(n => n.visible = true);
      return;
    }
    const lower = query.toLowerCase();
    Object.values(this.allNodes).forEach(n => {
      n.visible = n.tag.tenChiNhanh.toLowerCase().includes(lower) || n.tag.ma.toLowerCase().includes(lower);
    });
  }

  get totalCount() {
    return Object.keys(this.allNodes).length;
  }

  get selectedCount() {
    return Object.values(this.allNodes).filter(n => n.selected).length;
  }

  get rootCount() {
    return Object.keys(this.treeStructure).length;
  }

  get childCount() {
    return this.totalCount - this.rootCount;
  }
}
