import { ArrayDataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetTreeNodeDto } from 'shared/common/models';

import { TreeNode } from '../../../../../shared/containers';

@Component({
  selector: 'app-asset-hierarchy-dropdown',
  templateUrl: './asset-hierarchy-dropdown.component.html',
  styleUrls: ['./asset-hierarchy-dropdown.component.scss'],
})
export class AssetHierarchyDropdownComponent implements OnInit {
  rootNodes!: number;
  dataSource!: ArrayDataSource<AssetTreeNodeDto>;
  treeControl!: NestedTreeControl<AssetTreeNodeDto, string>;

  rootNode: Partial<AssetTreeNodeDto> = {
    children: [],
    name: { translate: 'GENERAL.ROOT_NODE' },
  };

  @Input() node?: TreeNode<AssetTreeNodeDto>;
  @Input() placeholder!: string;
  @Output() selected = new EventEmitter<string>();

  @Input() set assets(assets: AssetTreeNodeDto[]) {
    if (!this.node || !!this.node.parent) {
      this.rootNode.children = assets;
      assets = [{ ...this.rootNode }] as AssetTreeNodeDto[];
    }

    this.rootNodes = assets.length;
    this.dataSource = new ArrayDataSource(assets);
  }

  ngOnInit(): void {
    this.treeControl = new NestedTreeControl<AssetTreeNodeDto, string>(a => a.children, {
      trackBy: a => a.id,
    });
  }

  onSelect(id: string): void {
    this.selected.emit(id);
  }
}
