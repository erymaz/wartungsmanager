export class GraphApiFilterQueryBuilder {
  private _steps: any[] = [];

  constructor() {}

  addFilterEqualsExtensionField(
    field: string,
    value: string,
    appId: string,
  ): GraphApiFilterQueryBuilder {
    if (appId.indexOf('-') > -1) {
      appId = appId.replace(/\-/g, '');
    }

    const keyName = `extension_${appId}_${field}`;
    return this.addFilterEquals(keyName, value);
  }

  addFilterEquals(field: string, value: string): GraphApiFilterQueryBuilder {
    this._steps.push({
      Type: 'filter',
      Field: field,
      Op: 'eq',
      Value: value,
    });
    return this;
  }

  addFilterId(idValue: string): GraphApiFilterQueryBuilder {
    this._steps.push({
      Type: 'filter',
      Field: 'id',
      Op: 'eq',
      Value: idValue,
    });
    return this;
  }

  addFilterStartsWith(field: string, value: string): GraphApiFilterQueryBuilder {
    this._steps.push({
      Type: 'filter',
      Field: field,
      Op: 'startsWith',
      Value: value,
    });
    return this;
  }

  orGroupArray(orExpressions: GraphApiFilterQueryBuilder[]): GraphApiFilterQueryBuilder {
    const parts = [] as any; // new List<string>();

    for (const qb of orExpressions) {
      parts.push(qb.build());
    }

    this._steps.push({
      Type: 'subquery',
      Query: parts.join(' or '),
    });
    return this;
  }

  orGroup(
    callback: (queryBuilder: GraphApiFilterQueryBuilder) => GraphApiFilterQueryBuilder,
  ): GraphApiFilterQueryBuilder {
    return this.orGroupArray([callback(GraphApiFilterQueryBuilder.create())]);
  }

  build(): string {
    const trimmed = GraphApiFilterQueryBuilder.TrimBrackets(
      `(${this.BuildFilterPartsList().join(' and ')})`,
    );
    return '(' + trimmed + ')';
  }

  private BuildFilterPartsList(): string[] {
    const parts = [] as string[];

    for (const step of this._steps) {
      switch (step.Type) {
        case 'filter':
          parts.push(GraphApiFilterQueryBuilder.FilterToString(step));
          break;

        case 'subquery':
          parts.push(step.Query);
          break;

        default:
          throw new Error(`Step ${step.Type} not supported!`);
      }
    }

    return parts;
  }

  private static TrimBrackets(rawExpr: string): string {
    while (rawExpr.length > 0 && rawExpr.startsWith('(') && rawExpr.endsWith(')')) {
      rawExpr = rawExpr.substring(1, rawExpr.length - 1);
    }

    return rawExpr;
  }

  private static EscapeFilterString(rawString: string): string {
    return `'${rawString.replace("'", "\\'")}'`;
  }

  private static FilterToString(filter: any): string {
    switch (filter.Op) {
      case 'startsWith':
        return `startswith(${filter.Field}, ${this.EscapeFilterString(filter.Value)})`;
      case 'eq':
        return `${filter.Field} eq ${this.EscapeFilterString(filter.Value)}`;
    }

    throw new Error(`Operator ${filter.Op} not supported!`);
  }

  static create(): GraphApiFilterQueryBuilder {
    return new GraphApiFilterQueryBuilder();
  }
}
