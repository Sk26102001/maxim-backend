import EmailSetting from "../models/EmailSetting.js"

/**
 * GET email settings
 */
export const getEmailSettings = async (req, res) => {
    try {
        let settings = await EmailSetting.findOne()

        // If not exists, create default empty record
        if (!settings) {
            settings = await EmailSetting.create({
                user: "",
                password: "",
                emailFrom: "",
                emailName: "",
                provider: "zoho",
            })
        }

        res.json({
            success: true,
            settings,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

/**
 * UPDATE email settings
 */
export const updateEmailSettings = async (req, res) => {
    try {
        const { user, password, emailFrom, emailName, provider } = req.body

        let settings = await EmailSetting.findOne()

        if (!settings) {
            settings = new EmailSetting()
        }

        settings.user = user
        settings.password = password
        settings.emailFrom = emailFrom
        settings.emailName = emailName
        settings.provider = provider

        await settings.save()

        res.json({
            success: true,
            message: "Email settings updated successfully",
            settings,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
