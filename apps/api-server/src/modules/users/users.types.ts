export type UserListItem = {
	id: string;
	roleId: string;
	roleName: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string | null;
	isActive: boolean;
	lastLoginAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

export type UserDetail = UserListItem;
