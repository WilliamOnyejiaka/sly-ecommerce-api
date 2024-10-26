
export default function idValidator(id: any) {
    try {
        id = Number(id);

        if (isNaN(id)) {
            return {
                error: true,
                message: "Id must be an integer",
            }
        }

        return {
            error: false,
            id: id
        }
    } catch (error) {
        console.error("Invalid store id: ", error);
        return {
            error: true,
            message: "Id must be an integer",
        }
    }

}