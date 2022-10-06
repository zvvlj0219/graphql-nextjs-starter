import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServer } from 'apollo-server-micro'
import { schemaWithResolvers } from '../../graphql/schema';
import Cors from 'micro-cors'
import { MicroRequest } from 'apollo-server-micro/dist/types'
import { ServerResponse } from 'http'

const cors = Cors()

export const config = {
    api: {
        bodyParser: false,
    }
}

const apolloServer = new ApolloServer({ schema: schemaWithResolvers });

const startServer = apolloServer.start();

// export default cors(async (req: MicroRequest, res: ServerResponse) => {
//     if (req.method === 'OPTIONS') {
//       res.end()
//       return false
//     }
//     await startServer
  
//     await apolloServer.createHandler({
//       path: '/api/graphql',
//     })(req, res)
// })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    
    if (req.method === 'OPTIONS') {
        res.end()
        return false
    }

    await startServer
    await apolloServer.createHandler({
        path: '/api/graphql',
    })(req, res)
}

export default handler