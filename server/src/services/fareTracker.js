import axios from "axios"
import dayjs from "dayjs"
import Segment from "../models/segment.model.js"
import { mailer } from "../utils/mailer.js"

const API_KEY = process.env.TRIPJACK_API_KEY
const BASE_URL = process.env.TRIPJACK_BASE_URL
const ALERT_EMAIL = process.env.ALERT_EMAIL

function getLowestFlight(tripInfos, alertPrice) {
    let lowestFlight = null
    if (!tripInfos) return { lowestFlight, status: "no-flights" }

    Object.values(tripInfos).forEach((trips) => {
        trips.forEach((trip) => {
            trip.totalPriceList.forEach((price) => {
                const fare = price.fd.ADULT?.fC?.TF
                const seg = trip.sI?.[0]

                if (fare && seg) {
                    const flightCode = `${seg.fD.aI.code}${seg.fD.fN}`
                    const departureDate = dayjs(seg.dt).format("YYYY-MM-DD (ddd)")

                    const flightData = {
                        sector: `${seg.da.code} → ${seg.aa.code}`,
                        travelDate: departureDate,
                        airline: seg.fD.aI.name,
                        flightCode,
                        departure: seg.dt,
                        arrival: seg.at,
                        duration: `${Math.floor(seg.duration / 60)}h ${seg.duration % 60}m`,
                        fare,
                        logoUrl: `https://www.gstatic.com/flights/airline_logos/70px/${seg.fD.aI.code}.png`,
                    }

                    if (!lowestFlight || fare < lowestFlight.fare) {
                        lowestFlight = flightData
                    }
                }
            })
        })
    })

    if (!lowestFlight) return { lowestFlight: null, status: "no-flights" }

    if (lowestFlight.fare <= alertPrice) {
        return { lowestFlight, status: "alert" }
    }

    return { lowestFlight, status: "checked" }
}

async function sendAlertEmail(segment, flight) {
    const subject = `✈️ Flight Alert: ${segment.fromAirport} → ${segment.toAirport} on ${new Date(segment.departFromDate).toDateString()}`

    const formattedDepartTime = dayjs(flight.departure).format("HH:mm")
    const formattedDepartFull = dayjs(flight.departure).format("D MMMM YYYY dddd")

    const airlineName = flight.airline
    const htmlBody = `
      <div style="margin: 0; padding: 0; background-color: #f8f8f8">
            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color: #f8f8f8; padding: 20px 0"
            >
                <tr>
                    <td align="center">
                        <table
                            width="700"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                font-family: Arial, sans-serif;
                                border: 1px solid #d00;
                                padding: 15px;
                                border-radius: 4px;
                                background: #fff;
                            "
                        >
                            <!-- Header -->
                            <tr>
                                <td align="center" style="border-bottom: 2px solid #d00">
                                    <img
                                        src="https://res.cloudinary.com/dwgl1j9dq/image/upload/v1756104438/cdns/rl6cb0f1vdugo1umwsgt.png"
                                        alt="MaximTrip Logo"
                                        style="max-width: 300px; height: auto; display: block"
                                    />
                                    <h2
                                        style="
                                            background: #d00;
                                            color: #fff;
                                            padding: 8px 16px;
                                            border-radius: 4px;
                                            display: inline-block;
                                            font-size: 18px;
                                        "
                                    >
                                        FARE ALERT
                                    </h2>
                                </td>
                            </tr>

                            <!-- Airline block -->
                            <tr>
                                <td align="center" style="padding: 10px">
                                    <div
                                        style="
                                            font-size: 20px;
                                            font-weight: bold;
                                            padding: 8px 4px;
                                            display: inline-flex;
                                            align-items: center;
                                            gap: 8px;
                                        "
                                    >
                                        <img
                                            src="${flight.logoUrl}"
                                            alt="${airlineName} Logo"
                                            style="height: 28px; width: auto; display: inline-block"
                                        />
                                        ${airlineName}
                                    </div>
                                </td>
                            </tr>

                            <!-- Flight Info Table -->
                            <tr>
                                <td style="padding: 15px">
                                    <table
                                        width="100%"
                                        border="1"
                                        cellspacing="0"
                                        cellpadding="8"
                                        style="
                                            border-collapse: collapse;
                                            border: 1px solid #d00;
                                            font-size: 14px;
                                        "
                                    >
                                        <tr>
                                            <td><b>FARE ID</b></td>
                                            <td>${segment.fareId}</td>
                                        </tr>
                                        <tr>
                                            <td><b>SECTOR</b></td>
                                            <td>✈ ${flight.sector}</td>
                                        </tr>
                                        <tr>
                                            <td><b>TRAVEL DATE</b></td>
                                            <td>📅 ${formattedDepartFull}</td>
                                        </tr>
                                        <tr>
                                            <td><b>FLIGHT</b></td>
                                            <td>${flight.airline}</td>
                                        </tr>
                                        <tr>
                                            <td><b>FLIGHT #</b></td>
                                            <td>${flight.flightCode}</td>
                                        </tr>
                                        <tr>
                                            <td><b>DEPART</b></td>
                                            <td>${formattedDepartTime}</td>
                                        </tr>
                                        <tr>
                                            <td><b>DURATION</b></td>
                                            <td>${flight.duration} Non Stop</td>
                                        </tr>
                                        <tr>
                                            <td><b>ALERT PRICE</b></td>
                                            <td style="color: #d00">Rs. ${segment.alertPrice}</td>
                                        </tr>
                                        <tr>
                                            <td><b>CURRENT PRICE</b></td>
                                            <td
                                                style="
                                                    color: #d00;
                                                    font-size: 28px;
                                                    font-weight: bold;
                                                "
                                            >
                                                Rs. ${flight.fare}
                                            </td>
                                        </tr>
                                    </table>
                                    <p
                                        style="
                                            font-size: 12px;
                                            text-align: center;
                                            margin-top: 15px;
                                            color: #555;
                                        "
                                    >
                                        Note: This is an auto-generated email, please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
`

    await mailer.sendMail({
        from: `"Fare Tracker" <${process.env.SMTP_USER}>`,
        to: ALERT_EMAIL,
        subject,
        html: htmlBody,
    })
}

export const trackFares = async () => {
    try {
        const segments = await Segment.find().populate("airline")

        for (const seg of segments) {
            if (seg.status === "alert") {
                console.log(`Skipping ${seg.fromAirport} → ${seg.toAirport} (already ALERT)`)
                continue
            }

            const airlines = seg.airline.map((a) => ({ code: a.code.toUpperCase() }))

            const body = {
                searchQuery: {
                    paxInfo: {
                        ADULT: String(seg.adult),
                        CHILD: String(seg.child),
                        INFANT: String(seg.infant),
                    },
                    searchModifiers: { isDirectFlight: true },
                    preferredAirline: airlines,
                    routeInfos: [
                        {
                            fromCityOrAirport: { code: seg.fromAirport.toUpperCase() },
                            toCityOrAirport: { code: seg.toAirport.toUpperCase() },
                            travelDate: seg.departFromDate.toISOString().split("T")[0],
                        },
                    ],
                },
            }

            const res = await axios.post(`${BASE_URL}/fms/v1/air-search-all`, body, {
                headers: { apikey: API_KEY, "Content-Type": "application/json" },
                family: 4,
            })

            const { lowestFlight, status } = getLowestFlight(res.data.searchResult?.tripInfos, seg.alertPrice)

            let update = {
                apiCount: (seg.apiCount || 0) + 1,
                lowestFlight,
                currentPrice: lowestFlight?.fare || null,
                status,
            }

            if (!lowestFlight) {
                console.log(`No flights for ${seg.fromAirport} → ${seg.toAirport}`)
            } else if (status === "alert") {
                console.log(
                    `ALERT: ${seg.fromAirport} → ${seg.toAirport} | ${lowestFlight.airline} ${lowestFlight.flightCode} | Fare: Rs. ${lowestFlight.fare} | Alert: Rs. ${seg.alertPrice}`
                )
                await sendAlertEmail(seg, lowestFlight)
            } else {
                console.log(
                    `Cheapest ${seg.fromAirport} → ${seg.toAirport}: ${lowestFlight.airline} ${lowestFlight.flightCode} | Rs. ${lowestFlight.fare} (Alert: Rs. ${seg.alertPrice})`
                )
            }

            await Segment.findByIdAndUpdate(seg._id, update, { new: true })
        }
    } catch (err) {
        console.error("Fare tracker error:", err.response?.data || err.message)
    }
}
