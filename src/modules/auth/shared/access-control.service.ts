import { Injectable } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role.enum';

interface IsAuthorizedParams {
  currentRole: UserRole;
  requiredRole: UserRole;
}

@Injectable()
export class AccessControlService {
  private hierarchies: Array<Map<string, number>> = [];
  private priority: number = 1;

  constructor() {
    this.buildRoles([
      UserRole.PARENT,
      UserRole.ADMINISTRATOR,
    ]);
  }
  private buildRoles(roles: UserRole[]) {
    const hierarchy: Map<string, number> = new Map();
    roles.forEach((role) => {
      hierarchy.set(role, this.priority);
      this.priority++;
    });
    this.hierarchies.push(hierarchy);
  }
  public isAuthorized({ currentRole, requiredRole }: IsAuthorizedParams) {
    for (const hierarchy of this.hierarchies) {
      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);
      if (priority && requiredPriority && priority >= requiredPriority)
        return true;
    }
    return false;
  }
}