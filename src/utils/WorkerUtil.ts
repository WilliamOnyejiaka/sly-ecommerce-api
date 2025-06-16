import { NotificationType, StreamEvents } from "../types/enums";
import BaseService from "../services/bases/BaseService";

export default class WorkerUtil {

    public static processResponse(type: NotificationType, error: boolean, message: string | null, data: any = {}) {
        return {
            error: error,
            message: message,
            data: data,
            notificationType: type
        }
    }

    public static handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return WorkerUtil.processResponse(NotificationType.DB_ERROR, true, repoResult.message as string);
        }
        return null;
    }

    public static notificationData(type: StreamEvents, returnvalue: any, userDetails: any) {
        return {
            type: type,
            data: {
                error: returnvalue.error,
                message: returnvalue.message,
                notificationType: returnvalue.notificationType,
                userDetails: userDetails,
                data: returnvalue.data
            },
        };
    }

    public static convertMetaToFiles(images: any) {
        const service = new BaseService();
        return service.convertMetaToFiles(images);
    }

} 