import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_TRANSFORM_KEY = 'isSkipTransform';

export const SkipTransform = () => SetMetadata(IS_SKIP_TRANSFORM_KEY, true);
