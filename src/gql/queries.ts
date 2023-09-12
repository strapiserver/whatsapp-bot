import { gql } from "graphql-request";

export const createExchangerMutation = gql`
  mutation createPhysicalExchanger(
    $lng: Float!
    $lat: Float!
    $contact: String!
  ) {
    createPhysicalExchanger(
      data: { lng: $lng, lat: $lat, contact: $contact, opened: true }
    ) {
      data {
        id
        attributes {
          contact
        }
      }
    }
  }
`;

export const AuthMutation = gql`
  mutation login {
    login(
      input: {
        identifier: "whatsapp_bot"
        password: "x#@TH4L-#U"
        provider: "local"
      }
    ) {
      jwt
      user {
        username
        email
      }
    }
  }
`;
