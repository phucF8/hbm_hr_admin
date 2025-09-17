import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.css'],
  imports: [FormsModule, CommonModule],   // 👈 phải thêm vào đây

})
export class TreeNodeComponent {
  @Input() node!: any;
  @Input() level: number = 0;

  toggleExpand() {
    this.node.expanded = !this.node.expanded;
  }

  toggleSelect() {
    this.node.selected = !this.node.selected;
    this.updateChildrenSelection(this.node, this.node.selected);
    this.updateParentSelection(this.node);
  }

  /** Đệ quy set selected cho toàn bộ con */
  private updateChildrenSelection(node: any, selected: boolean) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        child.selected = selected;
        this.updateChildrenSelection(child, selected);
        this.updateParentSelection(this.node);
      });
    }
  }

  /** Cập nhật trạng thái parent dựa vào children */
  private updateParentSelection(node: any) {
    if (!node.parent) return; // node gốc thì dừng

    const parent = node.parent;
    const children = parent.children || [];

    const allSelected = children.every((c: any) => c.selected);
    const noneSelected = children.every((c: any) => !c.selected && !c.indeterminate);

    parent.selected = allSelected;
    parent.indeterminate = !allSelected && !noneSelected;

    // đệ quy cập nhật cha
    this.updateParentSelection(parent);
  }

}
