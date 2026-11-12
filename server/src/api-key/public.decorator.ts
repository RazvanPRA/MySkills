import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'senior-prep:public';

/** Opts a route out of the API key check. Only for routes that reveal nothing (health). */
export const Public = () => SetMetadata(IS_PUBLIC, true);
